require('./configure-browser')

const React = require('react'),
  ReactDOM = require('react-dom'),
  Router = require('./main/router.js'),
  globals = require('./globals'),
  T = require('./general/t'),
  Loading = require('./general/loading'),
  TranslationTool = require('../../barona-js/translate-react/translation-tool'),
  {ErrorContainer} = require('./main/errors'),
  axiosRetry = require('./axios-retry')

const systemSettingsLoader = axiosRetry({ url: '/api/system/settings'})
  .then(response => globals.systemSettings = response.data)

const translationLoader = systemSettingsLoader.then(async (systemSettings) => {
  const language = systemSettings.user.language || 'en'
  const response = await axiosRetry({url: `/translations/${language}.json`})
  T.setTranslations(response.data)
})

globals.translationToolOpen = !!window.localStorage.getItem('translation-tool-open')

const Root = React.createClass({
  getInitialState() {
    return {
      loaded: false,
      systemSettings: null
    }
  },

  render() {
    if (!this.state.loaded) {
      return <Loading />
    } else {
      return <div className={'app-env-' + this.state.systemSettings.env.type}>
        <ErrorContainer />
        { this.state.systemSettings.env.type === 'dev' ?
          <TranslationTool supportedLanguages={this.state.systemSettings.supportedLanguages}
                           currentLanguage={this.state.systemSettings.user.language || 'en'}/> : null }
        { Router }
      </div>
    }
  },

  async componentWillMount() {
    await translationLoader
    const systemSettings = await systemSettingsLoader
    this.setState({
      systemSettings: systemSettings,
      loaded: true
    })
  }
})

document.addEventListener('DOMContentLoaded', function() {
  ReactDOM.render(<Root />, document.querySelector('#app'))
})