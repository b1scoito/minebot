var mineflayer = require('mineflayer');
var names = require('./names.json');
if (process.argv.length < 3 || process.argv.length > 6) {
    console.log('Usage : node app.js <quantidade> <host> <port> <version>')
    process.exit(1)
}
console.log("MinecraftBOT beta ~ 0.32 made by b1scoito")
console.log('\x1b[31m',
    "BOT " + '\x1b[0m', "Joining!")
var seilazao = process.argv[2];
let i = 0
var seila2 = Math.floor(Math.random() * names.length);

function next() {
    if (i < seilazao) {
        i++
        setTimeout(() => {
            createBot(names[seila2] + i)
            next()
        }, 100)
    }
}
next()

function createBot(name) {
    var bot = mineflayer.createBot({
        version: process.argv[5],
        username: name,
        host: process.argv[3],
        port: parseInt(process.argv[4]),
        verbose: true
    });
    bot.on('login', () => {
        console.log('\x1b[31m',
            "BOT " + '\x1b[0m' ,
            'LOGIN:  ' + bot.username)
    })
    bot.once('spawn', () => {
        setInterval(watchTarget, 50)

        function watchTarget() {
            if (!target) return
            bot.lookAt(target.position.offset(0, target.height, 0))
        }
    })
    bot.on('message', function (msg, _username) {
        console.log('\x1b[31m',
            "LOG " + '\x1b[32m',
            bot.username, '\x1b[0m' + " " + msg.toString())
    })
    let target = null
    bot.on('chat', function (username, message) {
        if (username === bot.username) return
        target = bot.players[username].entity
        switch (message) {
            case 'frente':
                bot.chat("Indo pra frente.")
                bot.setControlState('left', false)
                bot.setControlState('back', false)
                bot.setControlState('right', false)
                bot.setControlState('forward', true)
                bot.setControlState('jump', true)
                break;
            case 'direita':
                bot.chat("Indo pra direita.")
                bot.setControlState('forward', false)
                bot.setControlState('left', false)
                bot.setControlState('back', false)
                bot.setControlState('right', true)
                bot.setControlState('jump', true)
                break;
            case 'esquerda':
                bot.chat("Indo pra esquerda.")
                bot.setControlState('forward', false)
                bot.setControlState('back', false)
                bot.setControlState('right', false)
                bot.setControlState('left', true)
                bot.setControlState('jump', true)
                break;
            case 'tras':
                bot.chat("Indo pra trás.")
                bot.setControlState('forward', false)
                bot.setControlState('left', false)
                bot.setControlState('right', false)
                bot.setControlState('back', true)
                bot.setControlState('jump', true)
                break;
            case 'parar':
                bot.chat("Parando todos controles")
                bot.clearControlStates()
                break;
            case 'tp':
                bot.entity.position.y += 10
                break
            case 'pos':
                bot.chat(bot.entity.position.toString())
                break
            case 'seguir':
                bot.chat("Seguindo.")
                bot.setControlState('left', false)
                bot.setControlState('back', false)
                bot.setControlState('right', false)
                bot.setControlState('forward', true)
                break;
            case 'killaura':
                entity = nearestEntity()
                if (entity) {
                    bot.attack(entity, true)
                } else {
                    bot.chat('no nearby entities')
                }
                break
            case 'pular':
                bot.setControlState('jump', true)
                bot.setControlState('jump', false)
                break
        }
    })
    bot.on('end', () => {
        console.log('\x1b[31m',
            "BOT " + '\x1b[32m',
            bot.username, '\x1b[0m' + " Disconnected")
        bot.quit()
    })

    function nearestEntity(type) {
        let id
        let entity
        let dist
        let best = null
        let bestDistance = null
        for (id in bot.entities) {
            entity = bot.entities[id]
            if (type && entity.type !== type) continue
            if (entity === bot.entity) continue
            dist = bot.entity.position.distanceTo(entity.position)
            if (!best || dist < bestDistance) {
                best = entity
                bestDistance = dist
            }
        }
        return best
    }
}