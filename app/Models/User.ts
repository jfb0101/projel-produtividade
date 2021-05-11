import { DateTime } from 'luxon'
import Hash from '@ioc:Adonis/Core/Hash'
import {
  column,
  beforeSave,
  BaseModel,
  belongsTo,
  BelongsTo,
  HasMany,
  hasMany,
  scope,
} from '@ioc:Adonis/Lucid/Orm'

import Cargo from 'App/Models/Cargo'
import Rdo from 'App/Models/Rdo'
import RdoUser from 'App/Models/RdoUser'
import AtividadeRdoUser from 'App/Models/AtividadeRdoUser'
import Contrato from 'App/Models/Contrato'

export default class User extends BaseModel {
  @belongsTo(() => Cargo)
  public cargo: BelongsTo<typeof Cargo>

  @belongsTo(() => Contrato)
  public contrato: BelongsTo<typeof Contrato>

  @hasMany(() => Rdo)
  public rdos: HasMany<typeof Rdo>

  @hasMany(() => RdoUser)
  public rdoUsers: HasMany<typeof RdoUser>

  @hasMany(() => AtividadeRdoUser)
  public atividades: HasMany<typeof AtividadeRdoUser>

  @column({ isPrimary: true })
  public id: number

  @column()
  public nome: string

  @column()
  public cpf: string

  @column()
  public cargoId: number

  @column()
  public contratoId: number

  @column()
  public banco: string

  @column()
  public agencia: string

  @column()
  public conta: string

  @column()
  public operacaoCaixa: string

  @column({ serializeAs: null })
  public password: string

  @column()
  public rememberMeToken?: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeSave()
  public static async hashPassword(user: User) {
    if (user.$dirty.password) {
      user.password = await Hash.make(user.password)
    }
  }

  public static inContract = scope((query, contratoId: number) => {
    query.where({ contratoId })
  })
}
