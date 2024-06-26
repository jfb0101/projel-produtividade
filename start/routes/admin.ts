import Route from '@ioc:Adonis/Core/Route'

Route.get('/', async ({ response }) => {
  return response.redirect().toRoute('admin.dashboard.index')
})

Route.group(() => {
  Route.resource('atividades', 'AtividadesController').except(['show'])
  Route.resource('cargos', 'CargosController').except(['show'])
  Route.resource('configuracoes', 'ConfiguracoesController').only(['index', 'store'])
  Route.resource('contratos', 'ContratosController')
  Route.resource('dashboard', 'DashboardController').only(['index'])
  Route.resource('equipamentos', 'EquipamentosController').except(['show'])
  Route.resource('users', 'UsersController').except(['show'])
  Route.resource('rdos', 'RdosController').except(['create', 'store'])
  Route.resource('apps/download', 'AppDownloadersController').only(['index', 'show'])
  Route.resource('apps/upload', 'AppFileUploadersController').except(['edit'])

  Route.group(() => {
    Route.resource('logs', 'UserLogsController').only(['index'])
  })
    .namespace('App/Controllers/Http/Admin/Configuracoes')
    .as('configuracoes')
    .prefix('configuracoes')

  Route.resource('areas', 'AreasController').only(['index'])
  Route.group(() => {
    Route.resource('furos', 'FurosController').except(['show'])
    Route.resource('complexos', 'ComplexosController').except(['show'])
    Route.resource('estruturas', 'EstruturasController').except(['show'])
    Route.resource('minas', 'MinasController').except(['show'])
  })
    .namespace('App/Controllers/Http/Admin/Areas')
    .as('areas')
    .prefix('areas')

  Route.resource('rdos/:rdoId/users', 'RdoUsersController')
    .only(['store', 'destroy'])
    .as('rdo_users')

  Route.resource('rdos/:rdoId/equipamentos', 'RdoEquipamentosController')
    .only(['store', 'destroy'])
    .as('rdo_equipamentos')

  Route.resource('rdos/:rdoId/atividades', 'RdoAtividadesController')
    .only(['store', 'destroy'])
    .as('rdo_atividades')

  // reports
  Route.group(() => {
    Route.resource('atividades-usuarios', 'AtividadeRdoUsersController').only(['index'])
    Route.resource('atividades-equipamentos', 'AtividadesEquipamentosController').only(['index'])
    Route.resource('producao-usuarios', 'ProducaoUsersController').only(['index'])
    Route.get('producao-usuarios-excel', 'ProducaoUsersController.downloadExcel').as(
      'producao-usuarios-excel'
    )
    Route.resource('producao-equipamentos', 'ProducaoEquipamentosController').only(['index'])
    Route.resource('horas-paradas-equipamentos', 'HorasParadasEquipamentosController').only([
      'index',
    ])
    Route.resource('relatorio-completo-producao', 'RelatorioCompletoProducaoController').only(['index'])
  })
    .namespace('App/Controllers/Http/Admin/Reports')
    .as('reports')
    .prefix('reports')

  Route.resource('ajuda', 'HelpsController').except(['create', 'store'])
})
  .namespace('App/Controllers/Http/Admin')
  .as('admin')
  .prefix('admin')
  .middleware(['auth', 'permission', 'sync', 'sessionStorage', 'log'])
