exports.configure = function (app, env, shared) {
    const routers = [
        'system.js',
        'migrations.js'
    ]
    const allRouters = routers
    for (let router of allRouters) {
        require(`./routes/${router}`).configure(app, env, shared)
    }
}