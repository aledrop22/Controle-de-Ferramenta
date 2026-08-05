import sqlite3
import pandas as pd
from datetime import datetime

ARQUIVO_SQLITE = 'registro_movimentacao_instrumentos.db'

def carregar_dados():
    """Carrega todos os dados do banco SQLite"""
    conn = sqlite3.connect(ARQUIVO_SQLITE)
    df = pd.read_sql_query("SELECT * FROM movimentacoes", conn)
    conn.close()
    
    if df.empty:
        print("Nenhum dado encontrado no banco de dados.")
        return None
    
    return df

def exportar_csv(df, nome_arquivo=None):
    """Exporta os dados para CSV"""
    if df is None:
        print("Não há dados para exportar.")
        return
    
    if nome_arquivo is None:
        nome_arquivo = f"registro_movimentacao_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    
    df.to_csv(nome_arquivo, index=False, sep=';', encoding='utf-8-sig')
    print(f"Dados exportados para: {nome_arquivo}")

def mostrar_estatisticas(df):
    """Mostra estatísticas dos dados"""
    if df is None:
        return
    
    print(f"\n{'='*50}")
    print("ESTATÍSTICAS DO BANCO DE DADOS")
    print(f"{'='*50}")
    print(f"Total de registros: {len(df)}")
    print(f"Em Uso: {len(df[df['Status'] == 'Em Uso'])}")
    print(f"Devolvidos: {len(df[df['Status'] == 'Devolvido'])}")
    print(f"{'='*50}\n")

def mostrar_dados(df):
    """Mostra todos os dados em formato de tabela"""
    if df is None:
        return
    
    print("\nDADOS COMPLETOS:")
    print(df.to_string())

if __name__ == "__main__":
    # Carregar dados
    df = carregar_dados()
    
    if df is not None:
        # Mostrar estatísticas
        mostrar_estatisticas(df)
        
        # Mostrar dados
        mostrar_dados(df)
        
        # Perguntar se quer exportar
        resposta = input("\nDeseja exportar os dados para CSV? (s/n): ")
        if resposta.lower() == 's':
            exportar_csv(df)
