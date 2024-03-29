import { DateTime } from 'luxon'
import ExcelJS from 'exceljs'
import Contrato from 'App/Models/Contrato'

interface QueryRow {
  equipamento: string
  data: string
  hora_inicio: string
  hora_fim: string
  horas: number
  atividade: string
}

export default class HorasParadasEquipamentoExcelService {
  constructor(protected contratoId, protected initialDate, protected finalDate) {}

  public async build(data: QueryRow[], total: number) {
    const workbook = new ExcelJS.Workbook()

    const worksheet = workbook.addWorksheet('Horas Paradas')

    const dataInicial = DateTime.fromISO(this.initialDate).toFormat('dd/MM/yyyy')
    const dataFinal = DateTime.fromISO(this.finalDate).toFormat('dd/MM/yyyy')
    const contrato = await Contrato.find(this.contratoId)

    worksheet.columns = [
      {
        header: ['Equipamento', 'Sonda'],
        key: 'equipamento',
        width: 20,
        style: {
          alignment: { horizontal: 'center', vertical: 'middle' },
        },
      },
      {
        header: [data[0]?.equipamento || '', 'Data'],
        key: 'data',
        width: 25,
        style: {
          alignment: { horizontal: 'center', vertical: 'middle' },
        },
      },
      {
        header: ['Data', 'Hora Inicio'],
        key: 'hora_inicio',
        width: 15,
        style: {
          alignment: { horizontal: 'center', vertical: 'middle' },
        },
      },
      {
        header: [`${dataInicial} - ${dataFinal}`, 'Hora Final'],
        key: 'hora_fim',
        width: 35,
        style: {
          alignment: { horizontal: 'center', vertical: 'middle' },
        },
      },
      {
        header: ['Contrato', 'Quantidade'],
        key: 'horas',
        width: 15,
        style: {
          alignment: { horizontal: 'center', vertical: 'middle' },
        },
      },
      {
        header: [contrato?.numero || '', 'Atividade'],
        key: 'atividade',
        width: 100,
        style: { alignment: { vertical: 'middle' } },
      },
    ]

    worksheet.getRows(1, 2)?.forEach((row) => {
      row.height = 20

      row.eachCell((cell) => {
        cell.style = {
          ...cell.style,
          font: {
            name: 'Arial',
            bold: true,
          },
        }

        cell.fill = {
          pattern: 'gray0625',
          type: 'pattern',
        }
      })
    })

    data.forEach((item) => {
      worksheet.addRow({
        ...item,
        horas: item.horas.toPrecision(3),
      })
    })

    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.border = {
          top: {
            color: {
              argb: 'FF000000',
            },
            style: 'thin',
          },
          left: {
            color: {
              argb: 'FF000000',
            },
            style: 'thin',
          },
          bottom: {
            color: {
              argb: 'FF000000',
            },
            style: 'thin',
          },
          right: {
            color: {
              argb: 'FF000000',
            },
            style: 'thin',
          },
        }
      })
    })

    const totalRow = worksheet.addRow({
      equipamento: 'Total',
      data: '-',
      hora_inicio: '-',
      hora_fim: '-',
      horas: total.toPrecision(3),
      atividade: '-',
    })

    totalRow.height = 20
    totalRow.eachCell((cell) => {
      cell.fill = {
        pattern: 'gray0625',
        type: 'pattern',
      }

      cell.style = {
        ...cell.style,
        font: {
          name: 'Arial',
          bold: true,
        },
      }

      cell.border = {
        top: {
          color: {
            argb: 'FF000000',
          },
          style: 'thin',
        },
        left: {
          color: {
            argb: 'FF000000',
          },
          style: 'thin',
        },
        bottom: {
          color: {
            argb: 'FF000000',
          },
          style: 'thin',
        },
        right: {
          color: {
            argb: 'FF000000',
          },
          style: 'thin',
        },
      }
    })

    return workbook
  }
}
