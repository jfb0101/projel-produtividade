import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Atividade from 'App/Models/Atividade'
import AtividadeCargoValor from 'App/Models/AtividadeCargoValor'
import Cargo from 'App/Models/Cargo'

export default class AtividadesController {
  private tipos = ['produtiva', 'improdutiva', 'parada']
  private unidadeMedidas = ['unidades', 'metros']

  private validationMessages = {
    'descricao.required': 'Descrição é obrigatória.',
    'descricao.unique': 'Atividade já cadastrada, tente outra descrição.',
    'tipo.required': 'Tipo é obrigatório, selecione uma opção.',
    'unidade_medida.requiredWhen': 'Unidade de medida é obrigatória.',
  }

  public async index({ view, request, session }: HttpContextContract) {
    const { page, descricao, tipo } = request.qs()
    const contratoId: number = session.get('contratoId')

    let atividadesQuery = Atividade.query().apply((scopes) => scopes.inContract(contratoId))

    atividadesQuery = descricao
      ? atividadesQuery.where('descricao', 'ilike', `%${descricao}%`)
      : atividadesQuery

    atividadesQuery = tipo ? atividadesQuery.where({ tipo }) : atividadesQuery

    const atividades = await atividadesQuery.orderBy('descricao').paginate(page || 1)

    return view.render('admin/atividades/index', {
      atividades: atividades.baseUrl('atividades').toJSON(),
    })
  }

  public async create({ view, session }: HttpContextContract) {
    const contratoId: number = session.get('contratoId')
    const cargos = await Cargo.query().apply((scopes) => scopes.inContract(contratoId))

    return view.render('admin/atividades/create', {
      tipos: this.tipos,
      unidadeMedidas: this.unidadeMedidas,
      cargos,
    })
  }

  public async store({ request, response, session, logger }: HttpContextContract) {
    const contratoId: number = session.get('contratoId')

    const atividadeSchema = schema.create({
      descricao: schema.string({}, [
        rules.unique({
          column: 'descricao',
          table: 'atividades',
          where: {
            contrato_id: contratoId,
          },
        }),
      ]),
      tipo: schema.enum(this.tipos),
      cargoId: schema.array().members(schema.number()),
      valorUnitario: schema.array().members(schema.number()),
      unidade_medida: schema.string.optional({}, [rules.requiredWhen('tipo', '=', 'produtiva')]),
    })

    const { cargoId, valorUnitario, ...data } = await request.validate({
      schema: atividadeSchema,
      messages: this.validationMessages,
    })

    const atividadeCargosValoresData = cargoId.map((cid, index) => {
      return {
        cargoId: cid,
        valorUnitario: valorUnitario[index],
      }
    })

    try {
      const atividade = await Atividade.create({ contratoId, ...data })

      await atividade.related('atividadeCargoValores').createMany(atividadeCargosValoresData)

      session.flash('success', 'Atividade cadastrada.')
      return response.redirect().toRoute('admin.atividades.index')
    } catch (error) {
      logger.error(error)

      session.flash('error', error.message)
      return response.redirect().back()
    }
  }

  public async edit({ view, response, session, params, logger }: HttpContextContract) {
    const { id } = params

    try {
      const atividade = await Atividade.query()
        .where({ id })
        .preload('atividadeCargoValores', (q) => q.preload('cargo'))
        .firstOrFail()

      return view.render('admin/atividades/edit', {
        atividade: atividade.toJSON(),
        tipos: this.tipos,
        unidadeMedidas: this.unidadeMedidas,
      })
    } catch (error) {
      logger.error(error)

      session.flash('error', error.message)
      return response.redirect().back()
    }
  }

  public async update({ request, session, response, params, logger }: HttpContextContract) {
    const { id } = params

    const atividadeSchema = schema.create({
      descricao: schema.string({}, [
        rules.unique({
          column: 'descricao',
          table: 'atividades',
          whereNot: { id },
        }),
      ]),
      unidade_medida: schema.string(),
      tipo: schema.enum(this.tipos),
      cargoId: schema.array().members(schema.number()),
      valorUnitario: schema.array().members(schema.number()),
      atividadeCargoId: schema.array().members(schema.number()),
    })

    const { cargoId, valorUnitario, atividadeCargoId, ...data } = await request.validate({
      schema: atividadeSchema,
      messages: this.validationMessages,
    })

    const atividadeCargosValoresData = cargoId.map((cid, index) => {
      return {
        cargoId: cid,
        valorUnitario: valorUnitario[index],
        id: atividadeCargoId[index],
      }
    })

    try {
      await Atividade.query().where({ id }).update(data)

      await AtividadeCargoValor.updateOrCreateMany('id', atividadeCargosValoresData)

      session.flash('success', 'Atividade atualizada.')
      return response.redirect().toRoute('admin.atividades.index')
    } catch (error) {
      logger.error(error)

      session.flash('error', error.message)
      return response.redirect().back()
    }
  }

  public async destroy({ params, session, response, logger }: HttpContextContract) {
    const { id } = params

    try {
      await Atividade.query().where({ id }).delete()

      session.flash('success', 'Atividade deletada.')

      return response.redirect().back()
    } catch (error) {
      logger.error(error)
      session.flash('error', error.message)

      return response.redirect().back()
    }
  }
}
