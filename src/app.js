var mineflayer = require('mineflayer')
const vec3 = require('vec3')
require("discord.js")
var config = require('./config.json')
var estado = "sim"
var estadokill = "sim"
var names = require('./names.json')
if (process.argv.length < 6 || process.argv.length > 6) {
    console.log('Usage : node app.js <quantity> <host> <port> <version>')
    process.exit(1)
}
console.log("MinecraftBOT beta ~ 0.32 made by b1scoito")
console.log('\x1b[31m',
    "BOT " + '\x1b[0m', "Joining!")
var seilazao = process.argv[2]
let i = 0
var seila2 = Math.floor(Math.random() * names.length)

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
    })
    bot.on('login', () => {
        console.log('\x1b[31m',
            "BOT " + '\x1b[0m',
            'LOGIN:  ' + bot.username)
    })
    bot.once('spawn', () => {
    })
    bot.on('message', (message) => {
        console.log('\x1b[31m',
            "LOG " + '\x1b[29m',
            bot.username, '\x1b[0m' + " " + message.toAnsi())
    })
    let target = null
    bot.on('chat', function (username, message) {
        const args = message.slice(config.prefix.length).trim().split(/ +/g)
        const command = args.shift().toLowerCase()
        if (username === bot.username) return
        target = bot.players[username].entity
        switch (command) {
            case 'frente':
                bot.chat("Indo pra frente.")
                bot.setControlState('forward', true)
                break
            case 'direita':
                bot.chat("Indo pra direita.")
                bot.setControlState('right', true)
                break
            case 'esquerda':
                bot.chat("Indo pra esquerda.")
                bot.setControlState('left', true)
                break
            case 'tras':
                bot.chat("Indo pra trás.")
                bot.setControlState('back', true)
                break
            case 'parar':
                bot.chat("Parando todos controles")
                bot.clearControlStates()
                estado = "nao"
                estadokill = "nao"
                break
            case 'tp':
                if (!args[0]) {
                    bot.chat("Por favor insira a quantidade de blocos ex: !tp 10")
                    return
                }
                bot.chat("Teleportando para " + args[0] + " blocos.")
                bot.entity.position.y += parseInt(args[0])
                break
            case 'seguir':
                bot.chat("Seguindo.")
                var doidera = setInterval(watchTarget, 50)

                function watchTarget() {
                    if (estado === "sim") {
                        if (!target) return
                        bot.lookAt(target.position.offset(0, target.height, 0))
                    } else {
                        clearInterval(doidera)
                        estado = "sim"
                    }
                }
                bot.setControlState('forward', true)
                break
            case 'killaura':
                var doiderao2 = setInterval(atacar, 100)

                function atacar() {
                    if (estadokill === "sim") {
                        entity = nearestEntity()
                        if (entity) {
                            bot.attack(entity, true)
                        } else {
                            bot.chat('no nearby entities')
                        }
                    } else {
                        clearInterval(doiderao2)
                        estadokill = "sim"
                    }
                }
                break
            case 'pular':
                bot.setControlState('jump', true)
                bot.setControlState('jump', false)
                break
            case 'lista':
                sayItems()
                break
            case 'minerar':
                dig()
                break
            case 'construir':
                build()
                break
            case 'selecionar':
                if (!args[0]) {
                    bot.chat("Por favor insira a quantidade até 8")
                    return
                }
                if (args[0] > 8) {
                    bot.chat("Valor muito alto")
                    return
                } else {
                    bot.chat("Slot selecionado: " + args[0])
                    bot.setQuickBarSlot(args[0])
                }
        }
    })
    bot.on('rain', () => {
        if (bot.isRaining) {
            bot.chat('Termino de chuve caraio.')
        } else {
            bot.chat('Comecou a chuver deixa eu resolver essa trela ae')
            bot.chat("/weather clear")
        }
    })

    bot.on('death', () => {
        bot.chat('Morri x.x')
    })
    bot.on('end', () => {
        console.log('\x1b[31m',
            "BOT " + '\x1b[32m',
            bot.username, '\x1b[0m' + " Disconnected trying to reconnect")
        bot.quit()
        mineflayer.createBot({
            version: process.argv[5],
            username: "botbackup" + i,
            host: process.argv[3],
            port: parseInt(process.argv[4]),
            verbose: true
        })
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

    function canSee(pos) {
        const block = bot.blockAt(pos)
        const r = bot.canSeeBlock(block)
        if (r) {
            bot.chat(`I can see the block of ${block.displayName} at ${pos}`)
        } else {
            bot.chat(`I cannot see the block of ${block.displayName} at ${pos}`)
        }
    }

    function sayItems(items = bot.inventory.items()) {
        const output = items.map(itemToString).join(', ')
        if (output) {
            bot.chat(output)
        } else {
            bot.chat('Nenhum item encontrado.')
        }
    }

    function dig() {
        if (bot.targetDigBlock) {
            bot.chat(`Ja estou minerando ${bot.targetDigBlock.name}`)
        } else {
            var target = bot.blockAt(bot.entity.position.offset(0, -1, 0))
            if (target && bot.canDigBlock(target)) {
                bot.chat(`Comecando a minerar ${target.name}`)
                bot.dig(target, onDiggingCompleted)
            } else {
                bot.chat('Não posso minerar')
            }
        }

        function onDiggingCompleted(err) {
            if (err) {
                console.log(err.stack)
                return
            }
            bot.chat(`Terminei de minerar! ${target.name}`)
        }
    }

    function build() {
        const referenceBlock = bot.blockAt(bot.entity.position.offset(0, -1, 0))
        const jumpY = bot.entity.position.y + 1.0
        bot.setControlState('jump', true)
        bot.on('move', placeIfHighEnough)

        function placeIfHighEnough() {
            if (bot.entity.position.y > jumpY) {
                bot.placeBlock(referenceBlock, vec3(0, 1, 0), (err) => {
                    if (err) {
                        bot.chat(err.message)
                        return
                    }
                    bot.chat('Coloquei o bloco!')
                })
                bot.setControlState('jump', false)
                bot.removeListener('move', placeIfHighEnough)
            }
        }
    }

    function itemToString(item) {
        if (item) {
            return `${item.name} x ${item.count}`
        } else {
            return '(nothing)'
        }
    }
}