import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom'
import Loader from '../../components/Loader'

interface Cargo {
  id: number
  titulo: string
}

interface Atividade {
  id: number
  descricao: string
  tipo: string
  unidade_medida: string
  atividadeCargoValores: {
    id: number
    cargo_id: number
    atividade_id: number
    valor_unitario: number
    cargo: {
      id: number
      titulo: string
    }
  }[]
}

interface CreateAtividadesProps {
  cargos: Cargo[]
  atividade: Atividade
}

const EditAtividades: React.FC<CreateAtividadesProps> = ({ atividade }) => {
  const tipos = ['produtiva', 'improdutiva', 'parada']
  const unidadeMedidas = ['unidades', 'metros']

  const [tipo, setTipo] = useState('')

  useEffect(() => {
    setTipo(atividade.tipo)
  }, [atividade.tipo])

  if (!atividade) {
    return <Loader />
  }

  return (
    <React.Fragment>
      <div className="form-group">
        <label htmlFor="tipo">Tipo</label>
        <select onChange={(ev) => setTipo(ev.target.value)} value={tipo} name="tipo" id="tipo">
          <option value="">Selecione</option>
          {tipos.map((tipo, index) => {
            return (
              <option value={tipo} key={index}>
                {tipo}
              </option>
            )
          })}
        </select>

        {/* @if(flashMessages.has(field))
          <span class="input-validation">
            {{ flashMessages.get(field) }}
          </span>
        @endif */}
      </div>

      {tipo === 'produtiva' ? (
        <React.Fragment>
          <div className="form-group">
            <label htmlFor="unidade_medida">Unidade de medida</label>
            <select
              name="unidade_medida"
              defaultValue={atividade.unidade_medida}
              id="unidade_medida"
            >
              <option value="">Selecione</option>
              {unidadeMedidas.map((unidade, index) => {
                return (
                  <option value={unidade} key={index}>
                    {unidade}
                  </option>
                )
              })}
            </select>

            {/* @if(flashMessages.has(field))
          <span class="input-validation">
            {{ flashMessages.get(field) }}
          </span>
        @endif */}
          </div>

          <h2>Valor unitário por cargo</h2>

          <table className="table">
            <thead>
              <tr>
                <th className="text-left">Cargo</th>
                <th className="text-right">Valor Unitário</th>
              </tr>
            </thead>

            <tbody>
              {atividade.atividadeCargoValores.map((atividadeCargo, cargoIndex) => {
                return (
                  <tr key={cargoIndex}>
                    <td className="text-left">
                      {atividadeCargo.cargo.titulo}
                      <input
                        type="hidden"
                        defaultValue={atividadeCargo.id}
                        name={`atividadeCargoId[${cargoIndex}]`}
                      />
                      <input
                        type="hidden"
                        defaultValue={atividadeCargo.cargo.id}
                        name={`cargoId[${cargoIndex}]`}
                      />
                    </td>
                    <td className="text-right">
                      <input
                        className="w-25"
                        type="text"
                        defaultValue={atividadeCargo.valor_unitario}
                        name={`valorUnitario[${cargoIndex}]`}
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </React.Fragment>
      ) : null}
    </React.Fragment>
  )
}

const container = document.querySelector('#react-edit-atividade')

if (container) {
  const cargosRaw = container.getAttribute('data-cargos')
  const cargos = JSON.parse(cargosRaw ?? '[]')
  const atividadeRaw = container.getAttribute('data-atividade')
  const atividade = JSON.parse(atividadeRaw ?? '[]')

  ReactDOM.render(<EditAtividades cargos={cargos} atividade={atividade} />, container)
}
