'use client'

import { useState } from 'react'
import { Plus, ArrowLeft, Check } from 'lucide-react'

const setoresOperadores = {
  "Usinagem": ["Pedro Henrique", "Alex", "Vitor", "Rodrigo", "Vinícius", "Márcio", "Gabriel", "Lucas", "Jadson"],
  "Produção": ["Sr. Luis", "Luis", "Daniel", "Felipe", "Jadson"],
  "Manutenção": ["Nilson", "Marcos", "Renato"],
  "Estoque": ["Elias", "Lucas", "Victor", "Rafael"],
  "Expedição": ["Karina", "Deise", "Frank", "Giulia", "Adriano", "Ismael"]
} as const

type Setor = keyof typeof setoresOperadores

const maquinasLista = ["GL 01", "GL 02", "CNC 01", "CNC 02", "FRESA 01", "FRESA 02", "TORNO 01", "TORNO 02", "TORNO 03", "PRODUÇÃO", "EXPEDIÇÃO", "ESTOQUE", "MANUTENÇÃO", "PCP"]

const estoque = {
  'Porca Calibradora': ['M3 x 0,35', 'M4 x 0,5', 'M5 x 0,5', 'M6 x 0,75', 'M8 x 1', 'M10 x 1', 'M12 x 1', 'M12 x 1,5', 'M14 x 1', 'M14 x 1,5', 'M16 x 1', 'M16 x 1,5', 'M18 x 1', 'M18 x 1,5', 'M20 x 1', 'M20 x 1,5', 'M22 x 1,5', 'M24 x 1,5', 'M27 x 1,5', 'M30 x 1,5'],
  'Micrômetro': ['0 - 25', '25 - 50', '50 - 75', '75 - 100', '100 - 125', '125 - 150', '150 - 175', '175 - 200', '200 - 225', '225 - 250', '250 - 275', '275 - 300', '0 - 1"', '1 - 2"'],
  'Súbito': ['6 - 10', '10 - 18', '18 - 35', '35 - 50', '50 - 160'],
  'Relógio Comparador': ['Relógio 1', 'Relógio 2', 'Relógio 3'],
  'Paquímetro': ['Modelo Digital']
}

type Ferramenta = {
  instrumento: string
  especificacao: string
}

type Registro = {
  id: string
  ferramentas: Ferramenta[]
  operador: string
  setor: string
  maquina: string
  dataRetirada: string
  horaRetirada: string
  dataRetorno: string
  horaRetorno: string
  status: 'Em Uso' | 'Devolvido'
}

export default function Home() {
  const [tela, setTela] = useState<'dashboard' | 'retirada'>('dashboard')
  const [registros, setRegistros] = useState<Registro[]>([])
  const [operadorLogado, setOperadorLogado] = useState<string | null>(null)
  const [setorLogado, setSetorLogado] = useState<Setor | null>(null)
  const [maquinaSelecionada, setMaquinaSelecionada] = useState('')
  const [ferramentasSelecionadas, setFerramentasSelecionadas] = useState<string[]>([])
  const [outraFerramenta, setOutraFerramenta] = useState('')

  const handleRetirada = () => {
    if (!maquinaSelecionada || ferramentasSelecionadas.length === 0) {
      alert('Selecione máquina e pelo menos uma ferramenta')
      return
    }

    const agora = new Date()
    const novoRegistro: Registro = {
      id: agora.getTime().toString() + Math.random().toString(36).substr(2, 9),
      ferramentas: ferramentasSelecionadas.map(ferramenta => {
        const [categoria, ...detalhes] = ferramenta.split(' - ')
        return {
          instrumento: categoria,
          especificacao: detalhes.join(' - ')
        }
      }),
      operador: operadorLogado!,
      setor: setorLogado!,
      maquina: maquinaSelecionada,
      dataRetirada: agora.toLocaleDateString('pt-BR'),
      horaRetirada: agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      dataRetorno: '',
      horaRetorno: '',
      status: 'Em Uso'
    }
    setRegistros(prev => [...prev, novoRegistro])

    setFerramentasSelecionadas([])
    setMaquinaSelecionada('')
    setOperadorLogado(null)
    setSetorLogado(null)
    setTela('dashboard')
  }

  const handleDevolucao = (id: string) => {
    const agora = new Date()
    setRegistros(prev => prev.map(reg =>
      reg.id === id
        ? {
          ...reg,
          dataRetorno: agora.toLocaleDateString('pt-BR'),
          horaRetorno: agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          status: 'Devolvido' as const
        }
        : reg
    ))
  }

  const handleDevolucaoIndividual = (id: string, ferramentaIndex: number) => {
    const agora = new Date()
    setRegistros(prev => prev.flatMap(reg => {
      if (reg.id !== id) return reg

      const ferramentaDevolvida = reg.ferramentas[ferramentaIndex]
      const ferramentasRestantes = reg.ferramentas.filter((_, index) => index !== ferramentaIndex)
      const registroDevolvido: Registro = {
        id: agora.getTime().toString() + Math.random().toString(36).substr(2, 9),
        ferramentas: [ferramentaDevolvida],
        operador: reg.operador,
        setor: reg.setor,
        maquina: reg.maquina,
        dataRetirada: reg.dataRetirada,
        horaRetirada: reg.horaRetirada,
        dataRetorno: agora.toLocaleDateString('pt-BR'),
        horaRetorno: agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        status: 'Devolvido'
      }

      if (ferramentasRestantes.length === 0) {
        return [{ ...registroDevolvido }]
      }

      const registroEmUso: Registro = {
        ...reg,
        ferramentas: ferramentasRestantes
      }

      return [registroEmUso, registroDevolvido]
    }))
  }

  const toggleFerramenta = (categoria: string, especificacao: string) => {
    const key = `${categoria} - ${especificacao}`
    setFerramentasSelecionadas(prev =>
      prev.includes(key) ? prev.filter(f => f !== key) : [...prev, key]
    )
  }

  const addOutraFerramenta = () => {
    if (outraFerramenta.trim()) {
      const key = `Ferramenta Diversa - ${outraFerramenta}`
      if (!ferramentasSelecionadas.includes(key)) {
        setFerramentasSelecionadas(prev => [...prev, key])
        setOutraFerramenta('')
      }
    }
  }

  if (tela === 'dashboard') {
    const emUso = registros.filter(r => r.status === 'Em Uso')
    const devolvidos = registros.filter(r => r.status === 'Devolvido')
    const devolvidosRows = devolvidos.flatMap(reg =>
      reg.ferramentas.map((f, index) => ({
        key: `${reg.id}-${index}`,
        instrumento: f.instrumento,
        especificacao: f.especificacao,
        operador: reg.operador,
        maquina: reg.maquina,
        dataRetirada: `${reg.dataRetirada} ${reg.horaRetirada}`,
        dataRetorno: `${reg.dataRetorno} ${reg.horaRetorno}`
      }))
    )

    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">📊 Painel de Ferramentas - Tempo Real</h1>
            <button
              onClick={() => setTela('retirada')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-blue-700"
            >
              <Plus size={20} />
              Nova Retirada
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-green-100 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-green-800 mb-4">🟢 Ferramentas em Uso</h2>
              {emUso.length === 0 ? (
                <p className="text-gray-600">Nenhuma ferramenta retirada no momento.</p>
              ) : (
                emUso.map(reg => (
                  <div key={reg.id} className="bg-white p-4 rounded-lg mb-3 shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-bold">{reg.operador} ({reg.setor})</p>
                        <p className="text-sm text-gray-600">🏭 {reg.maquina}</p>
                      </div>
                      <button
                        onClick={() => handleDevolucao(reg.id)}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                      >
                        Devolver tudo
                      </button>
                    </div>
                    <div className="space-y-2">
                      {reg.ferramentas.map((f, index) => (
                        <div key={`${f.instrumento}-${f.especificacao}-${index}`} className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                          <div>
                            <p className="font-semibold">{f.instrumento}</p>
                            <p className="text-sm text-gray-600">{f.especificacao}</p>
                          </div>
                          <button
                            onClick={() => handleDevolucaoIndividual(reg.id, index)}
                            className="bg-orange-500 text-white px-3 py-1 rounded text-sm hover:bg-orange-600 ml-2"
                          >
                            Devolver
                          </button>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 mt-3">📅 Retirado: {reg.dataRetirada} às {reg.horaRetirada}</p>
                  </div>
                ))
              )}
            </div>

            <div className="bg-red-100 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-red-800 mb-4">🔴 Histórico de Devoluções</h2>
              {devolvidos.length === 0 ? (
                <p className="text-gray-600">Nenhuma devolução registrada ainda.</p>
              ) : (
                <div className="bg-white rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left">Instrumento</th>
                        <th className="px-4 py-2 text-left">Especificação</th>
                        <th className="px-4 py-2 text-left">Operador</th>
                        <th className="px-4 py-2 text-left">Máquina</th>
                        <th className="px-4 py-2 text-left">Data/Hora - Retirada</th>
                        <th className="px-4 py-2 text-left">Data/Hora - Devolução</th>
                      </tr>
                    </thead>
                    <tbody>
                      {devolvidosRows.map(row => (
                        <tr key={row.key} className="border-t text-sm">
                          <td className="px-4 py-2 font-medium">{row.instrumento}</td>
                          <td className="px-4 py-2">{row.especificacao}</td>
                          <td className="px-4 py-2">{row.operador}</td>
                          <td className="px-4 py-2">{row.maquina}</td>
                          <td className="px-4 py-2">{row.dataRetirada}</td>
                          <td className="px-4 py-2">{row.dataRetorno ? row.dataRetorno : 'Pendente'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">🛠️ Nova Retirada</h1>
          <button
            onClick={() => setTela('dashboard')}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-700"
          >
            <ArrowLeft size={20} />
            Voltar
          </button>
        </div>

        {!operadorLogado ? (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">👤 Passo 1: Quem é você?</h2>
            <select
              className="w-full p-3 border rounded-lg mb-4"
              onChange={(e) => setSetorLogado(e.target.value as Setor)}
              value={setorLogado || ''}
            >
              <option value="">Selecione seu Setor...</option>
              {Object.keys(setoresOperadores).map(setor => (
                <option key={setor} value={setor}>{setor}</option>
              ))}
            </select>

            {setorLogado && (
              <div>
                <p className="mb-3">Operadores do setor: <strong>{setorLogado}</strong></p>
                <div className="grid grid-cols-3 gap-3">
                  {setoresOperadores[setorLogado].map(operador => (
                    <button
                      key={operador}
                      onClick={() => setOperadorLogado(operador)}
                      className="bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600"
                    >
                      {operador}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-lg shadow flex items-center justify-between">
              <div>
                <p className="text-xl font-bold">Olá, {operadorLogado}!</p>
                <p>Setor: <strong>{setorLogado}</strong></p>
              </div>
              <button
                onClick={() => { setOperadorLogado(null); setSetorLogado(null); }}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Trocar Operador
              </button>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">🏭 Passo 2: Onde você vai usar?</h2>
              <select
                className="w-full p-3 border rounded-lg"
                value={maquinaSelecionada}
                onChange={(e) => setMaquinaSelecionada(e.target.value)}
              >
                <option value="">Selecione a Máquina...</option>
                {maquinasLista.map(maquina => (
                  <option key={maquina} value={maquina}>{maquina}</option>
                ))}
              </select>
            </div>

            {maquinaSelecionada && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">🔧 Passo 3: O que você vai retirar?</h2>

                {ferramentasSelecionadas.length > 0 && (
                  <div className="mb-4 p-3 bg-blue-50 rounded">
                    <p className="font-semibold mb-2">Ferramentas selecionadas:</p>
                    {ferramentasSelecionadas.map(f => (
                      <p key={f} className="text-sm">- {f}</p>
                    ))}
                  </div>
                )}

                <div className="space-y-4">
                  {Object.entries(estoque).map(([categoria, itens]) => (
                    <div key={categoria}>
                      <h3 className="font-semibold mb-2">{categoria}</h3>
                      <div className="grid grid-cols-4 gap-2">
                        {itens.map(item => {
                          const emUso = registros.some(r =>
                            r.status === 'Em Uso' &&
                            r.ferramentas.some(f => f.instrumento === categoria && f.especificacao === item)
                          )
                          const selecionado = ferramentasSelecionadas.includes(`${categoria} - ${item}`)

                          return (
                            <button
                              key={item}
                              onClick={() => toggleFerramenta(categoria, item)}
                              disabled={emUso}
                              className={`p-3 rounded border text-sm ${emUso
                                ? 'bg-gray-300 cursor-not-allowed'
                                : selecionado
                                  ? 'bg-green-500 text-white'
                                  : 'bg-white hover:bg-gray-50'
                                }`}
                            >
                              {item}
                              {selecionado && ' ✓'}
                              {emUso && ' (Em uso)'}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ))}

                  <div>
                    <h3 className="font-semibold mb-2">Outras Ferramentas</h3>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={outraFerramenta}
                        onChange={(e) => setOutraFerramenta(e.target.value)}
                        placeholder="Digite o nome da ferramenta..."
                        className="flex-1 p-3 border rounded-lg"
                      />
                      <button
                        onClick={addOutraFerramenta}
                        className="bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600"
                      >
                        Adicionar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleRetirada}
              className="w-full bg-green-600 text-white py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-2 hover:bg-green-700"
            >
              <Check size={24} />
              Confirmo a retirada em meu nome
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
