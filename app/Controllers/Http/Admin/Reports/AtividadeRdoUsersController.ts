import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'

export default class AtividadeRdoUsersController {
  public async index({ view, request, session }: HttpContextContract) {
    const contratoId: number = session.get('contratoId')

    const { userId, initialDate, finalDate } = request.qs()

    const users = await User.query()
      .apply((scopes) => scopes.inContract(contratoId))
      .orderBy('nome')

    if (!initialDate || !finalDate || !userId) {
      return view.render('admin/reports/atividade_rdo_users/index', {
        users: users.map((u) => u.toJSON()),
      })
    }

    const user = await User.query()
      .where({ id: userId })
      .preload('rdoUsers', (qru) =>
        qru
          .whereHas('rdo', (qr) =>
            qr.whereBetween('data', [initialDate, finalDate]).andWhere({ contratoId })
          )
          .preload('rdo', (qr) =>
            qr.preload('rdoAtividades', (qra) => {
              qra
                .whereHas('atividade', (qa) => qa.where('tipo', 'produtiva'))
                .preload('atividade')
                .preload('rdo')
                .preload('furo')
            })
          )
      )
      .firstOrFail()

    user.rdoUsers.sort((a, b) => a.rdo.data.toMillis() - b.rdo.data.toMillis())

    return view.render('admin/reports/atividade_rdo_users/index', {
      users: users.map((u) => u.toJSON()),
      user: user.toJSON(),
    })
  }
}
