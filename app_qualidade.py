import streamlit as st
import pandas as pd
from datetime import datetime
import os
import pytz
from filelock import FileLock
import plotly.express as px
import time
from dados_comuns import setores_operadores, maquinas_lista, estoque

# --- CONFIGURAÇÃO INICIAL DA PÁGINA ---
st.set_page_config(page_title="Controle de Ferramentas", layout="wide", page_icon="🏭", initial_sidebar_state="expanded")

# --- VERIFICAÇÃO DE MODO DE ACESSO ---
query_params = st.query_params
modo_chao_fabrica = 'acesso' in query_params and query_params['acesso'] == 'chao'

# CSS para responsividade e tamanho de imagens
st.markdown("""
<style>
    /* Geral - Imagens menores para caber mais colunas */
    img {
        max-width: 70px !important;
        width: 70px !important;
        height: auto !important;
    }
    
    /* Containers com borda - compacto */
    div[data-testid="stVerticalBlock"] > div[data-testid="stVerticalBlock"] {
        gap: 0.3rem !important;
    }
    
    /* Mobile - Ajustes específicos */
    @media (max-width: 768px) {
        /* Imagens ainda menores em mobile */
        img {
            max-width: 50px !important;
            width: 50px !important;
        }
        
        /* Tabs/Abas - scroll horizontal */
        .stTabs [data-baseweb="tab-list"] {
            gap: 4px !important;
            overflow-x: auto !important;
            flex-wrap: nowrap !important;
        }
        
        .stTabs [data-baseweb="tab"] {
            font-size: 11px !important;
            padding: 6px 10px !important;
            white-space: nowrap !important;
        }
        
        /* Botões - compactos mas touch-friendly */
        button {
            min-height: 40px !important;
            font-size: 12px !important;
            padding: 8px 12px !important;
        }
        
        /* Texto - tamanho compacto */
        h1, h2, h3, h4 {
            font-size: 1rem !important;
        }
        
        /* Selectbox e inputs - compactos */
        .stSelectbox, .stTextInput {
            font-size: 14px !important;
        }
    }
    
    /* Tablet - médio */
    @media (min-width: 769px) and (max-width: 1024px) {
        img {
            max-width: 60px !important;
            width: 60px !important;
        }
    }
    
    /* Desktop - mantém tamanho padrão */
    @media (min-width: 1025px) {
        img {
            max-width: 70px !important;
            width: 70px !important;
        }
    }
</style>
""", unsafe_allow_html=True)

ARQUIVO_CSV = 'registro_movimentacao_instrumentos.csv'
ARQUIVO_LOCK = 'registro_movimentacao_instrumentos.csv.lock'
FUSO_HORARIO_BRASIL = pytz.timezone('America/Sao_Paulo')

# --- 1. FUNÇÕES DE BANCO DE DADOS (CSV) ---
def carregar_dados():
    if os.path.exists(ARQUIVO_CSV):
        df = pd.read_csv(ARQUIVO_CSV, sep=';', encoding='utf-8-sig', dtype=str).fillna("")
        # Se o CSV antigo não tiver a coluna 'Setor', nós adicionamos para não dar erro
        if 'Setor' not in df.columns:
            df.insert(4, 'Setor', 'Não Informado')
        # Se o CSV antigo não tiver a coluna 'Finalizacao_Esquecimento', nós adicionamos para não dar erro
        if 'Finalizacao_Esquecimento' not in df.columns:
            df['Finalizacao_Esquecimento'] = 'Não'
        
        # REMOVIDO: Reset automático no 1º dia do mês
        # Isso estava causando problemas onde ferramentas eram marcadas como devolvidas automaticamente
        
        return df
    else:
        return pd.DataFrame(columns=['ID', 'Instrumento', 'Especificacao', 'Operador', 'Setor', 'Maquina', 'Data_Retirada', 'Hora_Retirada', 'Data_Retorno', 'Hora_Retorno', 'Status', 'Finalizacao_Esquecimento'])

def salvar_dados(df):
    try:
        # Usa file lock para evitar conflitos de escrita
        with FileLock(ARQUIVO_LOCK, timeout=10):
            df.to_csv(ARQUIVO_CSV, index=False, sep=';', encoding='utf-8-sig')
        return True
    except Exception as e:
        st.error(f"❌ Erro ao salvar dados no CSV: {str(e)}")
        return False

# Inicialização de variáveis de sessão
if 'df_dados' not in st.session_state:
    st.session_state.df_dados = carregar_dados()
if 'tela_atual' not in st.session_state:
    st.session_state.tela_atual = 'dashboard'
if 'operador_logado' not in st.session_state:
    st.session_state.operador_logado = None
if 'setor_logado' not in st.session_state:
    st.session_state.setor_logado = None
if 'maquina_selecionada' not in st.session_state:
    st.session_state.maquina_selecionada = None
if 'ferramentas_selecionadas' not in st.session_state:
    st.session_state.ferramentas_selecionadas = []
if 'passo_retirada' not in st.session_state:
    st.session_state.passo_retirada = 1
if 'scroll_to_top' not in st.session_state:
    st.session_state.scroll_to_top = False
if 'aba_ativa' not in st.session_state:
    st.session_state.aba_ativa = 0
if 'transferencia_ativa' not in st.session_state:
    st.session_state.transferencia_ativa = None
if 'transferencia_setor' not in st.session_state:
    st.session_state.transferencia_setor = None
if 'transferencia_operador' not in st.session_state:
    st.session_state.transferencia_operador = None
if 'transferencia_maquina' not in st.session_state:
    st.session_state.transferencia_maquina = None


# Função para obter foto do operador (local ou placeholder)
def obter_foto_operador(nome):
    # Normalizar nome para nome de arquivo (remover espaços e caracteres especiais)
    nome_arquivo = nome.replace(' ', '_').replace('/', '_').replace('\\', '_')
    caminho_foto = f"fotos_operadores/{nome_arquivo}.jpg"
    
    # Verificar se a foto local existe
    if os.path.exists(caminho_foto):
        return caminho_foto
    else:
        # Placeholder se não existir foto local
        cores = ['4A90E2', '50E3C2', 'F5A623', 'D0021B', 'BD10E0', '8B572A', '417505']
        cor = cores[abs(hash(nome)) % len(cores)]
        return f"https://placehold.co/150x150/{cor}/FFFFFF?text={nome.replace(' ', '+')}"

# Geração de fotos para todos os operadores
todos_operadores = [nome for lista in setores_operadores.values() for nome in lista]
fotos_operadores = {nome: obter_foto_operador(nome) for nome in todos_operadores}


# ==========================================
# LÓGICA DE NAVEGAÇÃO DE TELAS
# ==========================================

if st.session_state.tela_atual == 'dashboard':
    # --- TELA 1: DASHBOARD EM TEMPO REAL ---
    
    # Scroll automático ao topo se necessário
    if st.session_state.scroll_to_top:
        st.markdown("""
            <script>
                window.scrollTo(0, 0);
            </script>
        """, unsafe_allow_html=True)
        st.session_state.scroll_to_top = False
    if modo_chao_fabrica:
        st.title("Dashboard em Tempo Real - Chão de Fábrica")
        # Recarregar dados automaticamente no modo chão de fábrica
        st.session_state.df_dados = carregar_dados()
    else:
        st.title("📊 Painel de Ferramentas - Qualidade (Interativo)")

    # Alerta antes das 17h (15-10 minutos antes) - apenas no modo chão de fábrica
    if modo_chao_fabrica:
        df = st.session_state.df_dados
        df_uso = df[df['Status'] == 'Em Uso']
        
        # Agrupar por operador
        if not df_uso.empty:
            operadores_ferramentas = df_uso.groupby('Operador').agg({
                'Instrumento': lambda x: ', '.join(x),
                'Especificacao': lambda x: ', '.join(x),
                'Maquina': 'first'
            }).reset_index()
            
            # Verificar horário de alerta (17h ou horário prorrogado)
            agora = datetime.now(FUSO_HORARIO_BRASIL)
            hora_atual = agora.hour + agora.minute / 60
            
            # Para cada operador, verificar se deve mostrar alerta
            for _, row in operadores_ferramentas.iterrows():
                operador = row['Operador']
                ferramentas = f"{row['Instrumento']} ({row['Especificacao']})"
                maquina = row['Maquina']
                
                # Obter horário de prorrogação do operador (padrão 17h)
                horario_limite = 17.0  # 17:00
                if f'prorrogacao_{operador}' in st.session_state:
                    horario_limite = st.session_state[f'prorrogacao_{operador}']
                
                # Condição real: mostrar apenas 15 min antes do horário limite
                if (hora_atual >= horario_limite - 0.25) and (hora_atual < horario_limite):  # 15 min antes
                    # Verificar se o alerta foi prorrogado recentemente (não mostrar se acabou de prorrogar)
                    alerta_prorrogado = st.session_state.get(f'alerta_prorrogado_{operador}', False)
                    if alerta_prorrogado:
                        # Se foi prorrogado, esconder alerta e resetar flag quando chegar próximo do novo horário
                        # Resetar flag se estiver 15 min antes do novo horário
                        if hora_atual >= horario_limite - 0.25:
                            st.session_state[f'alerta_prorrogado_{operador}'] = False
                        else:
                            continue
                    with st.container():
                        st.markdown(f"""
                            <div style="background-color: #FF0000; padding: 30px; border-radius: 10px; border: 5px solid #000000; margin-bottom: 20px;">
                                <h2 style="margin:0; color: #FFFF00; font-size: 28px; text-align: center; font-weight: bold;">
                                    ⚠️ ATENÇÃO - Obrigatório Retornar Ferramentas Retiradas da Qualidade
                                </h2>
                                <p style="margin:15px 0 0 0; color: #FFFF00; font-size: 18px; text-align: center;">
                                    <strong>Operador:</strong> {operador} | <strong>Máquina:</strong> {maquina}
                                </p>
                                <p style="margin:10px 0 0 0; color: #FFFF00; font-size: 16px; text-align: center;">
                                    <strong>Ferramentas:</strong> {ferramentas}
                                </p>
                            </div>
                        """, unsafe_allow_html=True)
                        
                        # Botão de prorrogação
                        col1, col2, col3 = st.columns([1, 2, 1])
                        with col2:
                            if st.button(f"⏰ Prorrogar Tempo - Horas Extras ({operador})", key=f"prorrogar_{operador}", use_container_width=True):
                                st.session_state[f'mostrar_prorrogacao_{operador}'] = True
                                st.rerun()
                        
                        # Campo para digitar horário de prorrogação
                        if st.session_state.get(f'mostrar_prorrogacao_{operador}', False):
                            with st.container():
                                st.markdown("---")
                                st.markdown(f"### ⏰ Prorrogar Horário para {operador}")
                                novo_horario = st.time_input("Até que horas você vai ficar?", value=datetime.now(FUSO_HORARIO_BRASIL).time(), key=f"tempo_prorrogacao_{operador}")
                                
                                col_confirmar, col_cancelar = st.columns([1, 1])
                                with col_confirmar:
                                    if st.button("✅ Confirmar Prorrogação", key=f"confirm_prorrogacao_{operador}", use_container_width=True):
                                        # Converter para formato decimal
                                        hora_decimal = novo_horario.hour + novo_horario.minute / 60
                                        st.session_state[f'prorrogacao_{operador}'] = hora_decimal
                                        st.session_state[f'mostrar_prorrogacao_{operador}'] = False
                                        st.session_state[f'alerta_prorrogado_{operador}'] = True  # Marcar que alerta foi prorrogado
                                        st.success(f"Horário prorrogado até {novo_horario.strftime('%H:%M')}")
                                        st.rerun()
                                
                                with col_cancelar:
                                    if st.button("❌ Cancelar", key=f"cancel_prorrogacao_{operador}", use_container_width=True):
                                        st.session_state[f'mostrar_prorrogacao_{operador}'] = False
                                        st.rerun()
                                
                                st.markdown("---")

    # Botão de ação e estatísticas na mesma linha
    # Definir variáveis globais antes dos blocos condicionais
    df = st.session_state.df_dados
    df_uso = df[df['Status'] == 'Em Uso']
    df_devolvidos = df[df['Status'] == 'Devolvido']
    
    if modo_chao_fabrica:
        # No modo chão de fábrica, mostra botão de atualização
        col_btn, col_stat1, col_stat2 = st.columns([1, 1, 1])
        with col_btn:
            if st.button("🔄 Atualizar", width='stretch'):
                st.session_state.df_dados = carregar_dados()
                st.rerun()
        with col_stat1:
            st.markdown("""
                <div style="background-color: #003366; padding: 20px; border-radius: 10px; border: 2px solid #003366; color: white; text-align: center;">
                    <h3 style="margin:0; font-size: 32px;">""" + str(len(df_uso)) + """</h3>
                    <p style="margin:5px 0 0 0; font-size: 16px;">🟢 Em Uso</p>
                </div>
            """, unsafe_allow_html=True)
        with col_stat2:
            devolvidas_hoje = len(df_devolvidos[df_devolvidos['Data_Retorno'] == datetime.now(FUSO_HORARIO_BRASIL).strftime("%d/%m/%Y")])
            st.markdown("""
                <div style="background-color: #000000; padding: 20px; border-radius: 10px; border: 2px solid #000000; color: white; text-align: center;">
                    <h3 style="margin:0; font-size: 32px;">""" + str(devolvidas_hoje) + """</h3>
                    <p style="margin:5px 0 0 0; font-size: 16px;">🔴 Devolvidas Hoje</p>
                </div>
            """, unsafe_allow_html=True)
    else:
        # Modo qualidade - mostra botão de nova retirada
        col_btn, col_stat1, col_stat2 = st.columns([1, 1, 1])
        with col_btn:
            if st.button("➕ Nova Retirada", width='stretch', type="primary"):
                st.session_state.tela_atual = 'retirada'
                st.session_state.operador_logado = None
                st.session_state.setor_logado = None
                st.rerun()
        with col_stat1:
            st.markdown("""
                <div style="background-color: #003366; padding: 20px; border-radius: 10px; border: 2px solid #003366; color: white; text-align: center;">
                    <h3 style="margin:0; font-size: 32px;">""" + str(len(df_uso)) + """</h3>
                    <p style="margin:5px 0 0 0; font-size: 16px;">🟢 Em Uso</p>
                </div>
            """, unsafe_allow_html=True)
        with col_stat2:
            devolvidas_hoje = len(df_devolvidos[df_devolvidos['Data_Retorno'] == datetime.now(FUSO_HORARIO_BRASIL).strftime("%d/%m/%Y")])
            st.markdown("""
                <div style="background-color: #000000; padding: 20px; border-radius: 10px; border: 2px solid #000000; color: white; text-align: center;">
                    <h3 style="margin:0; font-size: 32px;">""" + str(devolvidas_hoje) + """</h3>
                    <p style="margin:5px 0 0 0; font-size: 16px;">🔴 Devolvidas Hoje</p>
                </div>
            """, unsafe_allow_html=True)

    st.markdown("---")

    # Layout: Ferramentas em Uso em largura total
    with st.container(border=True):
        st.markdown("""
            <div style="background-color: #003366; padding: 15px; border-radius: 5px; color: white; margin-bottom: 15px;">
                <h4 style="margin:0; font-size: 18px;">🟢 Ferramentas em Uso (Tempo Real)</h4>
            </div>
        """, unsafe_allow_html=True)

        if not df_uso.empty:
            # Group by user only (regardless of date and time)
            grouped = df_uso.groupby(['Operador', 'Setor', 'Maquina'])

            for (operador, setor, maquina), group in grouped:
                with st.container(border=True):
                    foto_op = fotos_operadores.get(operador, "https://placehold.co/50x50/CCCCCC/000000?text=?")

                    c1, c2 = st.columns([0.5, 5])
                    with c1:
                        st.image(foto_op, width=60)
                    with c2:
                        st.markdown(f"👤 **{operador}** ({setor}) | 🏭 **{maquina}")
                        st.markdown(f"**{len(group)} ferramenta(s)**")
                        if not modo_chao_fabrica:
                            st.markdown("""
                                <style>
                                    div[data-testid="stButton"] > button[kind="secondary"] {
                                        background-color: #dc3545 !important;
                                        color: white !important;
                                    }
                                </style>
                            """, unsafe_allow_html=True)
                            texto_botao = "🔄 Devolver" if len(group) == 1 else "🔄 Devolver Tudo"
                            if st.button(texto_botao, key=f"dev_all_{operador}_{maquina}", type="secondary", use_container_width=True):
                                agora = datetime.now(FUSO_HORARIO_BRASIL)
                                # Recarregar dados para garantir sincronização
                                st.session_state.df_dados = carregar_dados()
                                for idx in group.index:
                                    # Usar ID para garantir atualização correta
                                    id_ferramenta = group.loc[idx, 'ID']
                                    mask = st.session_state.df_dados['ID'] == id_ferramenta
                                    if mask.any():
                                        st.session_state.df_dados.loc[mask, 'Data_Retorno'] = agora.strftime("%d/%m/%Y")
                                        st.session_state.df_dados.loc[mask, 'Hora_Retorno'] = agora.strftime("%H:%M")
                                        st.session_state.df_dados.loc[mask, 'Status'] = 'Devolvido'
                                        st.session_state.df_dados.loc[mask, 'Finalizacao_Esquecimento'] = 'Não'
                                if salvar_dados(st.session_state.df_dados):
                                    st.rerun()
                                else:
                                    st.error("❌ Não foi possível salvar a devolução. Tente novamente.")
                        
                        # Mostrar botões individuais
                        # No modo chão de fábrica: sempre mostrar botão de transferência
                        # No modo qualidade: mostrar apenas se houver mais de 1 ferramenta
                        if modo_chao_fabrica or len(group) > 1:
                            st.markdown("---")
                            for num, (idx, row) in enumerate(group.iterrows(), 1):
                                with st.container(border=True):
                                    if modo_chao_fabrica:
                                        col_num, col_tool, col_btn = st.columns([0.3, 5, 1])
                                        with col_num:
                                            st.markdown(f"**{num}**")
                                        with col_tool:
                                            st.markdown(f"**{row['Instrumento']}** ({row['Especificacao']})")
                                            st.markdown(f"📅 {row['Data_Retirada']} às {row['Hora_Retirada']}", help="Data de retirada")
                                        with col_btn:
                                            if st.button("Transferir", key=f"trans_{row['ID']}", width='stretch'):
                                                st.session_state.transferencia_ativa = row['ID']
                                                st.rerun()
                                        
                                        # Formulário de transferência inline (aparece abaixo do botão)
                                        if st.session_state.transferencia_ativa == row['ID']:
                                            st.markdown("---")
                                            st.markdown("""
                                                <div style="background-color: #FFA500; padding: 10px; border-radius: 5px; color: white; margin-bottom: 10px;">
                                                    <h5 style="margin:0; font-size: 14px;">🔄 Transferência de Ferramenta</h5>
                                                </div>
                                            """, unsafe_allow_html=True)
                                            
                                            st.info(f"Ferramenta: **{row['Instrumento']}** ({row['Especificacao']})")
                                            st.info(f"Operador atual: **{row['Operador']}** ({row['Setor']}) - {row['Maquina']}")
                                            
                                            # ETAPA 1: Seleção de setor
                                            if not ('transferencia_setor' in st.session_state and st.session_state.transferencia_setor):
                                                st.markdown("### Selecione o novo setor:")
                                                
                                                # Seleção de setor com botões
                                                colunas_por_linha = 3
                                                setores_lista = list(setores_operadores.keys())
                                                for i in range(0, len(setores_lista), colunas_por_linha):
                                                    cols = st.columns(colunas_por_linha)
                                                    for j in range(colunas_por_linha):
                                                        if i + j < len(setores_lista):
                                                            setor = setores_lista[i + j]
                                                            with cols[j]:
                                                                if st.button(f"🏢 {setor}", key=f"trans_setor_{row['ID']}_{setor}", width='stretch'):
                                                                    st.session_state.transferencia_setor = setor
                                                                    st.rerun()
                                            
                                            # ETAPA 2: Seleção de operador (após selecionar setor)
                                            elif not ('transferencia_operador' in st.session_state and st.session_state.transferencia_operador):
                                                st.markdown("### Selecione o novo operador:")
                                                
                                                operadores_setor = setores_operadores[st.session_state.transferencia_setor]
                                                
                                                # Adicionar CSS para botões de seleção de operadores
                                                st.markdown("""
                                                    <style>
                                                        div[data-testid="stButton"] > button[kind="default"] {
                                                            background-color: #003366 !important;
                                                            color: white !important;
                                                            border: 2px solid #003366 !important;
                                                            font-weight: bold !important;
                                                        }
                                                        div[data-testid="stButton"] > button[kind="default"]:hover {
                                                            background-color: #004080 !important;
                                                            border-color: #004080 !important;
                                                        }
                                                    </style>
                                                """, unsafe_allow_html=True)
                                                
                                                # Mostra as fotos em 6 colunas
                                                colunas_por_linha = 6
                                                for i in range(0, len(operadores_setor), colunas_por_linha):
                                                    cols = st.columns(colunas_por_linha)
                                                    for j in range(colunas_por_linha):
                                                        if i + j < len(operadores_setor):
                                                            nome_op = operadores_setor[i + j]
                                                            with cols[j]:
                                                                col_img, col_nome = st.columns([1, 3])
                                                                with col_img:
                                                                    st.image(fotos_operadores[nome_op], width=40)
                                                                with col_nome:
                                                                    if st.button(f"{nome_op}", key=f"trans_op_{row['ID']}_{nome_op}", width='stretch'):
                                                                        st.session_state.transferencia_operador = nome_op
                                                                        st.rerun()
                                                
                                                # Botão Retornar para voltar à seleção de setor
                                                st.markdown("---")
                                                if st.button("⬅️ Retornar", key=f"back_setor_{row['ID']}", use_container_width=True):
                                                    st.session_state.transferencia_setor = None
                                                    st.rerun()
                                            
                                            # ETAPA 3: Seleção de máquina (após selecionar operador)
                                            elif not ('transferencia_maquina' in st.session_state and st.session_state.transferencia_maquina):
                                                st.markdown("### Selecione a nova máquina:")
                                                
                                                maquinas_filtradas = [m for m in maquinas_lista if m != "Selecione..."]
                                                
                                                # Mostra as máquinas em 3 colunas
                                                colunas_por_linha = 3
                                                for i in range(0, len(maquinas_filtradas), colunas_por_linha):
                                                    cols = st.columns(colunas_por_linha)
                                                    for j in range(colunas_por_linha):
                                                        if i + j < len(maquinas_filtradas):
                                                            maquina = maquinas_filtradas[i + j]
                                                            with cols[j]:
                                                                if st.button(f"🏭 {maquina}", key=f"trans_maquina_{row['ID']}_{maquina}", width='stretch'):
                                                                    st.session_state.transferencia_maquina = maquina
                                                                    st.rerun()
                                                
                                                # Botão Retornar para voltar à seleção de operador
                                                st.markdown("---")
                                                if st.button("⬅️ Retornar", key=f"back_operador_{row['ID']}", use_container_width=True):
                                                    st.session_state.transferencia_operador = None
                                                    st.rerun()
                                            
                                            # ETAPA 4: Confirmação final (após selecionar tudo)
                                            else:
                                                st.markdown("---")
                                                st.success(f"**Setor:** {st.session_state.transferencia_setor}")
                                                st.success(f"**Operador:** {st.session_state.transferencia_operador}")
                                                st.success(f"**Máquina:** {st.session_state.transferencia_maquina}")
                                                
                                                # Três cards: Confirmar, Retornar, Cancelar
                                                col_confirmar, col_retornar, col_cancelar = st.columns([1, 1, 1])
                                                with col_confirmar:
                                                    if st.button("✅ Confirmar Transferência", key=f"confirm_trans_{row['ID']}", type="primary", use_container_width=True):
                                                        # Recarregar dados para garantir sincronização
                                                        st.session_state.df_dados = carregar_dados()
                                                        # Atualizar o registro
                                                        mask = st.session_state.df_dados['ID'] == row['ID']
                                                        if mask.any():
                                                            st.session_state.df_dados.loc[mask, 'Operador'] = st.session_state.transferencia_operador
                                                            st.session_state.df_dados.loc[mask, 'Setor'] = st.session_state.transferencia_setor
                                                            st.session_state.df_dados.loc[mask, 'Maquina'] = st.session_state.transferencia_maquina
                                                            st.session_state.df_dados.loc[mask, 'Data_Retirada'] = datetime.now(FUSO_HORARIO_BRASIL).strftime("%d/%m/%Y")
                                                            st.session_state.df_dados.loc[mask, 'Hora_Retirada'] = datetime.now(FUSO_HORARIO_BRASIL).strftime("%H:%M")
                                                            
                                                            if salvar_dados(st.session_state.df_dados):
                                                                # Limpar variáveis de transferência
                                                                st.session_state.transferencia_ativa = None
                                                                st.session_state.transferencia_setor = None
                                                                st.session_state.transferencia_operador = None
                                                                st.session_state.transferencia_maquina = None
                                                                st.rerun()
                                                            else:
                                                                st.error("❌ Não foi possível salvar a transferência. Tente novamente.")
                                                
                                                with col_retornar:
                                                    if st.button("⬅️ Retornar", key=f"back_maquina_{row['ID']}", use_container_width=True):
                                                        st.session_state.transferencia_maquina = None
                                                        st.rerun()
                                                
                                                with col_cancelar:
                                                    if st.button("❌ Cancelar", key=f"cancel_trans_{row['ID']}", use_container_width=True):
                                                        st.session_state.transferencia_ativa = None
                                                        st.session_state.transferencia_setor = None
                                                        st.session_state.transferencia_operador = None
                                                        st.session_state.transferencia_maquina = None
                                                        st.rerun()
                                    else:
                                        col_num, col_tool, col_btn = st.columns([0.3, 5, 1])
                                        with col_num:
                                            st.markdown(f"**{num}**")
                                        with col_tool:
                                            st.markdown(f"**{row['Instrumento']}** ({row['Especificacao']})")
                                            st.markdown(f"📅 {row['Data_Retirada']} às {row['Hora_Retirada']}", help="Data de retirada")
                                        with col_btn:
                                            if st.button("Devolver", key=f"dev_{row['ID']}", width='stretch'):
                                                agora = datetime.now(FUSO_HORARIO_BRASIL)
                                                # Recarregar dados para garantir sincronização
                                                st.session_state.df_dados = carregar_dados()
                                                # Usar ID para garantir atualização correta
                                                mask = st.session_state.df_dados['ID'] == row['ID']
                                                if mask.any():
                                                    st.session_state.df_dados.loc[mask, 'Data_Retorno'] = agora.strftime("%d/%m/%Y")
                                                    st.session_state.df_dados.loc[mask, 'Hora_Retorno'] = agora.strftime("%H:%M")
                                                    st.session_state.df_dados.loc[mask, 'Status'] = 'Devolvido'
                                                    st.session_state.df_dados.loc[mask, 'Finalizacao_Esquecimento'] = 'Não'
                                                if salvar_dados(st.session_state.df_dados):
                                                    st.rerun()
                                                else:
                                                    st.error("❌ Não foi possível salvar a devolução. Tente novamente.")
        else:
            st.info("Nenhuma ferramenta retirada no momento.")

    # --- HISTÓRICO DE DEVOLUÇÕES (APENAS MODO QUALIDADE) ---
    if not modo_chao_fabrica:
        st.markdown("---")
        with st.container(border=True):
            st.markdown("""
                <div style="background-color: #000000; padding: 15px; border-radius: 5px; color: white; margin-bottom: 15px;">
                    <h4 style="margin:0; font-size: 18px;">🔴 Histórico de Devoluções</h4>
                </div>
            """, unsafe_allow_html=True)

            if not df_devolvidos.empty:
                # Filtros
                col1, col2, col3, col4 = st.columns(4)
                with col1:
                    filtro_periodo = st.selectbox("Período:", ["Todos", "Hoje", "Últimos 7 dias", "Últimos 30 dias", "Últimos 60 dias", "Últimos 90 dias", "Este Mês", "Mês Anterior"], key="filtro_periodo")
                with col2:
                    filtro_operador = st.selectbox("Filtrar por Operador:", ["Todos"] + sorted(df_devolvidos['Operador'].unique().tolist()), key="filtro_operador")
                with col3:
                    filtro_ferramenta = st.selectbox("Filtrar por Ferramenta:", ["Todas"] + sorted(df_devolvidos['Instrumento'].unique().tolist()), key="filtro_ferramenta")
                with col4:
                    filtro_setor = st.selectbox("Filtrar por Setor:", ["Todos"] + sorted(df_devolvidos['Setor'].unique().tolist()), key="filtro_setor")
                
                # Aplicar filtros
                df_filtrado = df_devolvidos.copy()
                
                # Filtro de período
                if filtro_periodo != "Todos":
                    agora = datetime.now(FUSO_HORARIO_BRASIL)
                    data_atual_str = agora.strftime("%d/%m/%Y")
                    
                    if filtro_periodo == "Hoje":
                        df_filtrado = df_filtrado[df_filtrado['Data_Retorno'] == data_atual_str]
                    elif filtro_periodo == "Últimos 7 dias":
                        data_limite = (agora - pd.Timedelta(days=7)).strftime("%d/%m/%Y")
                        df_filtrado = df_filtrado[df_filtrado['Data_Retorno'] >= data_limite]
                    elif filtro_periodo == "Últimos 30 dias":
                        data_limite = (agora - pd.Timedelta(days=30)).strftime("%d/%m/%Y")
                        df_filtrado = df_filtrado[df_filtrado['Data_Retorno'] >= data_limite]
                    elif filtro_periodo == "Últimos 60 dias":
                        data_limite = (agora - pd.Timedelta(days=60)).strftime("%d/%m/%Y")
                        df_filtrado = df_filtrado[df_filtrado['Data_Retorno'] >= data_limite]
                    elif filtro_periodo == "Últimos 90 dias":
                        data_limite = (agora - pd.Timedelta(days=90)).strftime("%d/%m/%Y")
                        df_filtrado = df_filtrado[df_filtrado['Data_Retorno'] >= data_limite]
                    elif filtro_periodo == "Este Mês":
                        primeiro_dia_mes = agora.replace(day=1).strftime("%d/%m/%Y")
                        df_filtrado = df_filtrado[df_filtrado['Data_Retorno'] >= primeiro_dia_mes]
                    elif filtro_periodo == "Mês Anterior":
                        primeiro_dia_mes_atual = agora.replace(day=1)
                        ultimo_dia_mes_anterior = (primeiro_dia_mes_atual - pd.Timedelta(days=1))
                        primeiro_dia_mes_anterior = ultimo_dia_mes_anterior.replace(day=1)
                        df_filtrado = df_filtrado[(df_filtrado['Data_Retorno'] >= primeiro_dia_mes_anterior.strftime("%d/%m/%Y")) & (df_filtrado['Data_Retorno'] <= ultimo_dia_mes_anterior.strftime("%d/%m/%Y"))]
                
                if filtro_operador != "Todos":
                    df_filtrado = df_filtrado[df_filtrado['Operador'] == filtro_operador]
                if filtro_ferramenta != "Todas":
                    df_filtrado = df_filtrado[df_filtrado['Instrumento'] == filtro_ferramenta]
                if filtro_setor != "Todos":
                    df_filtrado = df_filtrado[df_filtrado['Setor'] == filtro_setor]
                
                if not df_filtrado.empty:
                    # Criar colunas combinadas de data/hora
                    df_filtrado['Data/Horas - Retirada'] = df_filtrado['Data_Retirada'] + ' às ' + df_filtrado['Hora_Retirada']
                    df_filtrado['Data/Horas - Devolução'] = df_filtrado['Data_Retorno'] + ' às ' + df_filtrado['Hora_Retorno']
                    # Ordenar por data/hora de devolução (mais recentes primeiro)
                    df_filtrado['Data_Hora_Devolucao_Sort'] = pd.to_datetime(df_filtrado['Data_Retorno'] + ' ' + df_filtrado['Hora_Retorno'], format='%d/%m/%Y %H:%M')
                    df_filtrado = df_filtrado.sort_values('Data_Hora_Devolucao_Sort', ascending=False)
                    df_display = df_filtrado[['Instrumento', 'Especificacao', 'Operador', 'Setor', 'Maquina', 'Data/Horas - Retirada', 'Data/Horas - Devolução', 'Finalizacao_Esquecimento']]
                    st.dataframe(df_display, hide_index=True, use_container_width=True)
                else:
                    st.info("Nenhum resultado encontrado com os filtros selecionados.")
            else:
                st.info("Nenhuma devolução registrada ainda.")

        # --- ESTATÍSTICAS DE USO POR PERÍODO ---
        st.markdown("---")
        with st.container(border=True):
            st.markdown("""
                <div style="background-color: #003366; padding: 15px; border-radius: 5px; color: white; margin-bottom: 15px;">
                    <h4 style="margin:0; font-size: 18px;">📊 Estatísticas de Uso por Período</h4>
                </div>
            """, unsafe_allow_html=True)
            
            # Seleção de período para estatísticas
            col_periodo = st.columns(1)
            with col_periodo[0]:
                periodo_estatisticas = st.selectbox("Selecione o período para análise:", 
                    ["Últimos 7 dias", "Últimos 30 dias", "Últimos 60 dias", "Últimos 90 dias", "Este Mês", "Mês Anterior", "Todos"],
                    key="periodo_estatisticas")
            
            # Filtrar dados pelo período selecionado
            df_estatisticas = df.copy()
            df_estatisticas['Data_Hora_Retirada'] = pd.to_datetime(df_estatisticas['Data_Retirada'] + ' ' + df_estatisticas['Hora_Retirada'], format='%d/%m/%Y %H:%M', errors='coerce')
            df_estatisticas['Data_Hora_Retorno'] = pd.to_datetime(df_estatisticas['Data_Retorno'] + ' ' + df_estatisticas['Hora_Retorno'], format='%d/%m/%Y %H:%M', errors='coerce')
            
            if periodo_estatisticas != "Todos":
                # Filtrar apenas registros com datas válidas
                df_estatisticas = df_estatisticas[df_estatisticas['Data_Retirada'] != ""]
                
                agora = datetime.now(FUSO_HORARIO_BRASIL)
                data_atual_str = agora.strftime("%d/%m/%Y")
                
                if periodo_estatisticas == "Hoje":
                    df_estatisticas = df_estatisticas[df_estatisticas['Data_Retirada'] == data_atual_str]
                elif periodo_estatisticas == "Últimos 7 dias":
                    data_limite = (agora - pd.Timedelta(days=7)).strftime("%d/%m/%Y")
                    df_estatisticas = df_estatisticas[df_estatisticas['Data_Retirada'] >= data_limite]
                elif periodo_estatisticas == "Últimos 30 dias":
                    data_limite = (agora - pd.Timedelta(days=30)).strftime("%d/%m/%Y")
                    df_estatisticas = df_estatisticas[df_estatisticas['Data_Retirada'] >= data_limite]
                elif periodo_estatisticas == "Últimos 60 dias":
                    data_limite = (agora - pd.Timedelta(days=60)).strftime("%d/%m/%Y")
                    df_estatisticas = df_estatisticas[df_estatisticas['Data_Retirada'] >= data_limite]
                elif periodo_estatisticas == "Últimos 90 dias":
                    data_limite = (agora - pd.Timedelta(days=90)).strftime("%d/%m/%Y")
                    df_estatisticas = df_estatisticas[df_estatisticas['Data_Retirada'] >= data_limite]
                elif periodo_estatisticas == "Este Mês":
                    primeiro_dia_mes = agora.replace(day=1).strftime("%d/%m/%Y")
                    df_estatisticas = df_estatisticas[df_estatisticas['Data_Retirada'] >= primeiro_dia_mes]
                elif periodo_estatisticas == "Mês Anterior":
                    primeiro_dia_mes_atual = agora.replace(day=1)
                    ultimo_dia_mes_anterior = (primeiro_dia_mes_atual - pd.Timedelta(days=1))
                    primeiro_dia_mes_anterior = ultimo_dia_mes_anterior.replace(day=1)
                    df_estatisticas = df_estatisticas[(df_estatisticas['Data_Retirada'] >= primeiro_dia_mes_anterior.strftime("%d/%m/%Y")) & (df_estatisticas['Data_Retirada'] <= ultimo_dia_mes_anterior.strftime("%d/%m/%Y"))]
            
            if not df_estatisticas.empty:
                col1, col2, col3 = st.columns(3)
                
                with col1:
                    st.markdown("""
                        <div style="background-color: #003366; padding: 15px; border-radius: 5px; color: white; text-align: center;">
                            <h3 style="margin:0; font-size: 24px;">""" + str(len(df_estatisticas)) + """</h3>
                            <p style="margin:5px 0 0 0; font-size: 14px;">Total de Retiradas</p>
                        </div>
                    """, unsafe_allow_html=True)
                
                with col2:
                    devolvidas_periodo = len(df_estatisticas[df_estatisticas['Status'] == 'Devolvido'])
                    st.markdown("""
                        <div style="background-color: #000000; padding: 15px; border-radius: 5px; color: white; text-align: center;">
                            <h3 style="margin:0; font-size: 24px;">""" + str(devolvidas_periodo) + """</h3>
                            <p style="margin:5px 0 0 0; font-size: 14px;">Devolvidas</p>
                        </div>
                    """, unsafe_allow_html=True)
                
                with col3:
                    em_uso_periodo = len(df_estatisticas[df_estatisticas['Status'] == 'Em Uso'])
                    st.markdown("""
                        <div style="background-color: #dc3545; padding: 15px; border-radius: 5px; color: white; text-align: center;">
                            <h3 style="margin:0; font-size: 24px;">""" + str(em_uso_periodo) + """</h3>
                            <p style="margin:5px 0 0 0; font-size: 14px;">Em Uso</p>
                        </div>
                    """, unsafe_allow_html=True)
                
                st.markdown("---")
                
                # Operadores que mais usaram
                col_top_op, col_top_ferr = st.columns(2)
                
                with col_top_op:
                    st.markdown("### 👤 Top Operadores por Uso")
                    contagem_operadores = df_estatisticas.groupby('Operador').size().reset_index(name='Quantidade')
                    contagem_operadores = contagem_operadores.sort_values('Quantidade', ascending=False).head(10)
                    
                    if not contagem_operadores.empty:
                        for idx, row in contagem_operadores.iterrows():
                            st.markdown(f"**{row['Operador']}:** {row['Quantidade']} retirada(s)")
                    else:
                        st.info("Nenhum dado disponível")
                
                with col_top_ferr:
                    st.markdown("### 🔧 Top Ferramentas por Uso")
                    contagem_ferramentas = df_estatisticas.groupby(['Instrumento', 'Especificacao']).size().reset_index(name='Quantidade')
                    contagem_ferramentas = contagem_ferramentas.sort_values('Quantidade', ascending=False).head(10)
                    
                    if not contagem_ferramentas.empty:
                        for idx, row in contagem_ferramentas.iterrows():
                            st.markdown(f"**{row['Instrumento']} ({row['Especificacao']}):** {row['Quantidade']} vez(es)")
                    else:
                        st.info("Nenhum dado disponível")
                
                st.markdown("---")
                
                # Estatísticas por Setor
                st.markdown("### 🏭 Mapa de Calor: Operadores vs Setores")
                
                # Criar matriz para heatmap
                heatmap_data = df_estatisticas.groupby(['Setor', 'Operador']).size().reset_index(name='Quantidade')
                
                if not heatmap_data.empty:
                    # Pivot para criar matriz
                    heatmap_matrix = heatmap_data.pivot(index='Setor', columns='Operador', values='Quantidade').fillna(0)
                    
                    # Criar heatmap com valores nas células
                    fig_heatmap = px.imshow(
                        heatmap_matrix,
                        labels=dict(x="Operador", y="Setor", color="Quantidade"),
                        x=heatmap_matrix.columns,
                        y=heatmap_matrix.index,
                        color_continuous_scale='Purples',
                        title='Intensidade de Uso por Setor e Operador',
                        text_auto=True  # Mostra valores nas células
                    )
                    fig_heatmap.update_traces(
                        texttemplate="%{z}",
                        textfont={"size": 10}
                    )
                    fig_heatmap.update_layout(
                        height=500,
                        xaxis={'tickangle': -45}
                    )
                    st.plotly_chart(fig_heatmap, use_container_width=True)
                else:
                    st.info("Nenhum dado disponível")
            else:
                st.info("Nenhum dado encontrado para o período selecionado.")


    # --- GRÁFICO DE FERRAMENTAS POR OPERADOR (APENAS MODO QUALIDADE) ---
    if not modo_chao_fabrica:
        st.markdown("---")
        st.subheader("📊 Resumo por Operador")
        if not df_uso.empty:
            # Contar ferramentas por operador
            contagem_operadores = df_uso.groupby('Operador').size().reset_index(name='Quantidade')
            contagem_operadores = contagem_operadores.sort_values('Quantidade', ascending=True)

            fig = px.line(
                contagem_operadores,
                x='Quantidade',
                y='Operador',
                title='Quantidade de Ferramentas por Operador',
                markers=True
            )
            fig.update_layout(
                xaxis_title="Quantidade",
                yaxis_title="Operador",
                xaxis=dict(tickmode='linear', tick0=0, dtick=1, gridcolor='rgba(255,255,255,0.2)', tickcolor='white'),
                yaxis=dict(gridcolor='rgba(255,255,255,0.2)', tickcolor='white'),
                plot_bgcolor='rgba(240,240,240,0.1)',
                paper_bgcolor='rgba(240,240,240,0.1)',
                height=400,
                font=dict(color='white')
            )
            fig.update_traces(line_color='#00BFFF', marker_color='#00BFFF', line_width=3, marker_size=8)
            st.plotly_chart(fig, use_container_width=True)
        else:
            st.info("Nenhum dado disponível para o gráfico.")

elif st.session_state.tela_atual == 'retirada':
    # --- TELA 2: FLUXO DE RETIRADA ---
    col_titulo, col_voltar = st.columns([8, 2])
    with col_titulo:
        st.title("🛠️ Nova Retirada")
    with col_voltar:
        st.markdown("<br>", unsafe_allow_html=True)
        if st.button("🔙 Cancelar e Voltar", width='stretch'):
            st.session_state.tela_atual = 'dashboard'
            st.session_state.ferramentas_selecionadas = []
            st.session_state.operador_logado = None
            st.session_state.setor_logado = None
            st.session_state.passo_retirada = 1
            st.rerun()

    st.markdown("---")

    # --- PASSO 1: ESCOLHER SETOR ---
    if st.session_state.passo_retirada == 1:
        st.markdown("""
            <div style="background-color: #003366; padding: 20px; border-radius: 5px; color: white; margin-bottom: 20px;">
                <h3 style="margin:0;">🏢 Passo 1: Qual é o seu setor?</h3>
            </div>
        """, unsafe_allow_html=True)

        st.markdown("---")
        st.write(f"Selecione seu setor:")

        # Mostra os setores em 3 colunas
        colunas_por_linha = 3
        setores_lista = list(setores_operadores.keys())
        for i in range(0, len(setores_lista), colunas_por_linha):
            cols = st.columns(colunas_por_linha)
            for j in range(colunas_por_linha):
                if i + j < len(setores_lista):
                    setor = setores_lista[i + j]
                    with cols[j]:
                        if st.button(f"🏢 {setor}", key=f"btn_setor_{setor}", width='stretch'):
                            st.session_state.setor_logado = setor
                            st.session_state.passo_retirada = 2
                            st.rerun()

    # --- PASSO 2: ESCOLHER NOME ---
    elif st.session_state.passo_retirada == 2:
        st.markdown(f"""
            <div style="background-color: #003366; padding: 20px; border-radius: 5px; color: white; margin-bottom: 20px;">
                <h3 style="margin:0;">👤 Passo 2: Qual é o seu nome?</h3>
                <p style="margin:5px 0 0 0;">Setor: {st.session_state.setor_logado}</p>
            </div>
        """, unsafe_allow_html=True)

        col_voltar_passo, _ = st.columns([1, 9])
        with col_voltar_passo:
            if st.button("⬅️ Voltar", width='stretch'):
                st.session_state.setor_logado = None
                st.session_state.passo_retirada = 1
                st.rerun()

        st.markdown("---")

        nomes_setor = setores_operadores[st.session_state.setor_logado]
        st.write(f"Operadores do setor: **{st.session_state.setor_logado}** (:red[Clique no seu nome])")
        
        # Adicionar CSS para botões de seleção de operadores
        st.markdown("""
            <style>
                div[data-testid="stButton"] > button[kind="default"] {
                    background-color: #003366 !important;
                    color: white !important;
                    border: 2px solid #003366 !important;
                    font-weight: bold !important;
                }
                div[data-testid="stButton"] > button[kind="default"]:hover {
                    background-color: #004080 !important;
                    border-color: #004080 !important;
                }
            </style>
        """, unsafe_allow_html=True)

        # Mostra as fotos em 6 colunas para aproveitar melhor o espaço
        colunas_por_linha = 6
        for i in range(0, len(nomes_setor), colunas_por_linha):
            cols = st.columns(colunas_por_linha)
            for j in range(colunas_por_linha):
                if i + j < len(nomes_setor):
                    nome_op = nomes_setor[i + j]
                    with cols[j]:
                        col_img, col_nome = st.columns([1, 3])
                        with col_img:
                            st.image(fotos_operadores[nome_op], width=50)
                        with col_nome:
                            if st.button(f"{nome_op}", key=f"btn_login_{nome_op}", width='stretch'):
                                st.session_state.operador_logado = nome_op
                                st.session_state.passo_retirada = 3
                                st.rerun()

    # --- PASSO 3: ESCOLHER MÁQUINA ---
    elif st.session_state.passo_retirada == 3:
        st.markdown(f"""
            <div style="background-color: #003366; padding: 20px; border-radius: 5px; color: white; margin-bottom: 20px;">
                <h3 style="margin:0;">🏭 Passo 3: Onde você vai usar?</h3>
                <p style="margin:5px 0 0 0;">{st.session_state.operador_logado} - {st.session_state.setor_logado}</p>
            </div>
        """, unsafe_allow_html=True)

        col_voltar_passo, _ = st.columns([1, 9])
        with col_voltar_passo:
            if st.button("⬅️ Voltar", width='stretch'):
                st.session_state.operador_logado = None
                st.session_state.passo_retirada = 2
                st.rerun()

        st.markdown("---")
        st.write(f"Selecione a máquina ou local de uso:")

        # Mostra as máquinas em 3 colunas
        colunas_por_linha = 3
        maquinas_filtradas = [m for m in maquinas_lista if m != "Selecione..."]
        for i in range(0, len(maquinas_filtradas), colunas_por_linha):
            cols = st.columns(colunas_por_linha)
            for j in range(colunas_por_linha):
                if i + j < len(maquinas_filtradas):
                    maquina = maquinas_filtradas[i + j]
                    with cols[j]:
                        if st.button(f"🏭 {maquina}", key=f"btn_maquina_{maquina}", width='stretch'):
                            st.session_state.maquina_selecionada = maquina
                            st.session_state.passo_retirada = 4
                            st.rerun()

    # --- PASSO 4: ESCOLHER FERRAMENTAS ---
    elif st.session_state.passo_retirada == 4:
        # Cards segmentados para informações
        col1, col2, col3 = st.columns(3)
        
        with col1:
            st.markdown(f"""
                <div style="background-color: #003366; padding: 20px; border-radius: 8px; color: white; text-align: center; border: 2px solid #003366; min-height: 100px; display: flex; flex-direction: column; justify-content: center;">
                    <p style="margin:0; font-size: 14px; font-weight: bold; opacity: 0.9;">👤 NOME</p>
                    <h4 style="margin:10px 0 0 0; font-size: 16px;">{st.session_state.operador_logado}</h4>
                </div>
            """, unsafe_allow_html=True)
        
        with col2:
            st.markdown(f"""
                <div style="background-color: #003366; padding: 20px; border-radius: 8px; color: white; text-align: center; border: 2px solid #003366; min-height: 100px; display: flex; flex-direction: column; justify-content: center;">
                    <p style="margin:0; font-size: 14px; font-weight: bold; opacity: 0.9;">🏭 MÁQUINA</p>
                    <h4 style="margin:10px 0 0 0; font-size: 16px;">{st.session_state.maquina_selecionada}</h4>
                </div>
            """, unsafe_allow_html=True)
        
        with col3:
            ferramenta_text = st.session_state.ferramentas_selecionadas[0] if st.session_state.ferramentas_selecionadas else "Nenhuma"
            if len(st.session_state.ferramentas_selecionadas) > 1:
                ferramenta_text = f"{len(st.session_state.ferramentas_selecionadas)} itens"
            st.markdown(f"""
                <div style="background-color: #003366; padding: 20px; border-radius: 8px; color: white; text-align: center; border: 2px solid #003366; min-height: 100px; display: flex; flex-direction: column; justify-content: center;">
                    <p style="margin:0; font-size: 14px; font-weight: bold; opacity: 0.9;">🔧 FERRAMENTA</p>
                    <h4 style="margin:10px 0 0 0; font-size: 16px;">{ferramenta_text}</h4>
                </div>
            """, unsafe_allow_html=True)

        st.markdown("<div style='margin-bottom: 20px;'></div>", unsafe_allow_html=True)

        col_voltar_passo, _ = st.columns([1, 9])
        with col_voltar_passo:
            if st.button("⬅️ Voltar", width='stretch'):
                st.session_state.maquina_selecionada = None
                st.session_state.passo_retirada = 3
                st.rerun()

        st.markdown("---")

        maquina_selecionada = st.session_state.maquina_selecionada
        
        # Mostrar ferramentas selecionadas
        if st.session_state.ferramentas_selecionadas:
            st.markdown("**Ferramentas selecionadas:**")
            for ferramenta in st.session_state.ferramentas_selecionadas:
                st.markdown(f"- {ferramenta}")
        
        # Adicionada a aba "Outras Ferramentas" no final
        opcoes_abas = ["Porca Calibradora", "Micrômetros", "Súbitos", "Relógio Comparador", "Paquímetro Digital", "Outras Ferramentas ➕"]
        aba_selecionada = st.radio("Selecione a categoria:", opcoes_abas, index=st.session_state.aba_ativa, horizontal=True, label_visibility="collapsed")

        def item_disponivel(instrumento, especificacao):
            df = st.session_state.df_dados
            em_uso = df[(df['Instrumento'] == instrumento) & (df['Especificacao'] == especificacao) & (df['Status'] == 'Em Uso')]
            return em_uso.empty

        def item_ja_selecionado(categoria, espec):
            return f"{categoria} - {espec}" in st.session_state.ferramentas_selecionadas

        def render_cards(categoria):
            st.markdown(f"##### {categoria}")
            itens = estoque[categoria]
            colunas_por_linha = 6
            
            for i in range(0, len(itens), colunas_por_linha):
                cols = st.columns(colunas_por_linha)
                for j in range(colunas_por_linha):
                    if i + j < len(itens):
                        espec = itens[i + j]
                        with cols[j]:
                            st.container(border=True)
                            texto_img = espec.replace(' ', '')
                            st.image(f"https://placehold.co/150x150/EEEEEE/31343C?text={texto_img}", width=70)
                            st.markdown(f"**{espec}**")
                            
                            if item_disponivel(categoria, espec):
                                if item_ja_selecionado(categoria, espec):
                                    col_sel, col_desm = st.columns(2)
                                    with col_sel:
                                        st.success("Selecionado")
                                    with col_desm:
                                        if st.button("Desmarcar", key=f"btn_desm_{categoria}_{espec}", width='stretch'):
                                            ferramenta_key = f"{categoria} - {espec}"
                                            st.session_state.ferramentas_selecionadas.remove(ferramenta_key)
                                else:
                                    if st.button("Selecionar", key=f"btn_sel_{categoria}_{espec}", width='stretch'):
                                        ferramenta_key = f"{categoria} - {espec}"
                                        st.session_state.ferramentas_selecionadas.append(ferramenta_key)
                                        st.success(f"Adicionado: {espec}")
                            else:
                                st.error("Em uso")

        # Atualiza o índice da aba ativa
        st.session_state.aba_ativa = opcoes_abas.index(aba_selecionada)
        
        # Renderiza a categoria selecionada
        if aba_selecionada == "Porca Calibradora":
            render_cards('Porca Calibradora')
        elif aba_selecionada == "Micrômetros":
            render_cards('Micrômetro')
        elif aba_selecionada == "Súbitos":
            render_cards('Súbito')
        elif aba_selecionada == "Relógio Comparador":
            render_cards('Relógio Comparador')
        elif aba_selecionada == "Paquímetro Digital":
            render_cards('Paquímetro Digital')
        elif aba_selecionada == "Outras Ferramentas ➕":
            st.markdown("##### 🛠️ Outras Ferramentas (Diversas)")
            st.info("Use este espaço para retirar alicates, martelos, chaves, etc.")
            
            outra_ferramenta = st.text_input("Digite o nome ou descrição da ferramenta:")
            
            col_sel, col_desm = st.columns(2)
            with col_sel:
                if st.button("Selecionar esta ferramenta digitada", width='stretch'):
                    if outra_ferramenta.strip() == "":
                        st.warning("Por favor, digite o nome da ferramenta antes de selecionar.")
                    else:
                        ferramenta_key = f"Ferramenta Diversa - {outra_ferramenta}"
                        if ferramenta_key not in st.session_state.ferramentas_selecionadas:
                            st.session_state.ferramentas_selecionadas.append(ferramenta_key)
                            st.success(f"Adicionado: {outra_ferramenta}")
                        else:
                            st.warning("Esta ferramenta já foi selecionada.")

        st.markdown("---")

        # --- CONFIRMAÇÃO FINAL ---
        if st.button("✅ Confirmo a retirada em meu nome", width='stretch', type="primary"):
            if not st.session_state.ferramentas_selecionadas:
                st.warning("⚠️ Atenção: Por favor, selecione pelo menos uma ferramenta nas abas.")
            else:
                agora = datetime.now(FUSO_HORARIO_BRASIL)
                for ferramenta in st.session_state.ferramentas_selecionadas:
                    categoria, detalhe = ferramenta.split(" - ", 1)
                    novo_id = agora.strftime('%Y%m%d%H%M%S') + str(len(st.session_state.df_dados))

                    novo_registro = {
                        'ID': novo_id,
                        'Instrumento': categoria,
                        'Especificacao': detalhe,
                        'Operador': st.session_state.operador_logado,
                        'Setor': st.session_state.setor_logado,
                        'Maquina': st.session_state.maquina_selecionada,
                        'Data_Retirada': agora.strftime("%d/%m/%Y"),
                        'Hora_Retirada': agora.strftime("%H:%M"),
                        'Data_Retorno': "",
                        'Hora_Retorno': "",
                        'Status': "Em Uso",
                        'Finalizacao_Esquecimento': 'Não'
                    }

                    df_novo = pd.DataFrame([novo_registro])
                    st.session_state.df_dados = pd.concat([st.session_state.df_dados, df_novo], ignore_index=True)
                if salvar_dados(st.session_state.df_dados):
                    # Limpa tudo e volta para o Dashboard
                    st.session_state.ferramentas_selecionadas = []
                    st.session_state.operador_logado = None
                    st.session_state.setor_logado = None
                    st.session_state.maquina_selecionada = None
                    st.session_state.passo_retirada = 1
                    st.session_state.tela_atual = 'dashboard'
                    st.session_state.scroll_to_top = True
                    st.rerun()
                else:
                    st.error("❌ Não foi possível salvar a retirada. Tente novamente.")

# --- AUTO-REFRESH PARA MODO CHÃO DE FÁBRICA ---
# REMOVIDO: time.sleep + st.rerun causa loop infinito no Streamlit Cloud
# Para atualização em tempo real, usar st.automatic_rerun em versões futuras
