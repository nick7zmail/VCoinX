const debug = require('debug')('vcoinx:utils')
const os = require('os')
const Sentry = require('@sentry/node')

// Отправка возникших ошибок на сервер, для улучшения дальнейшего процесса разработки
function initErrorsHandling () {
  (async () => {
    debug('Инициализирую Sentry')
    // Инициализируем Sentry
    Sentry.init({
      dsn: 'https://f2a9bef46d114c15a6e56146918437eb@sentry.io/1435409',
      // sampleRate: 0.75, // Отправляем только 75% ошибок
      debug: true,
    })
    // Настраиваем данные о том где запущен VCoinX
    Sentry.configureScope((scope) => {
      debug('Конфигурирую Sentry')
      const info = {
        username: os.userInfo().username + '@' + os.hostname(),
        os_type: os.type(),
        os_platform: os.platform(),
        os_arch: os.arch(),
        os_release: os.release(),
        os_totalmem: (os.totalmem() / 1024 / 1024).toFixed(2),
        os_cpus: String(os.cpus().length),
      }
      debug('Информация о системе где запущен VCoinX: %O', info)
      scope.setUser(info)
      process.on('uncaughtException', function (err) {
        Sentry.captureException(err)
      })
    })
  })()
}
// Запускаем захват и передачу на сервер информации об ошибках в процессе работы
initErrorsHandling()

// Глобальные конcтанты для быстрого определения в какой среде запущен VCoinX
Object.defineProperty(this, 'DEBUG', {
  get: () => process.env.NODE_ENV === 'development',
})
global.DEV = this.DEBUG
global.DEBUG = this.DEBUG
global.RELEASE = !this.DEBUG

module.exports = {
  Sentry,
  initErrorsHandling,
}
