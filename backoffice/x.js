const fs = require('fs')
const path = require('path')
const execSync = require('child_process').execSync
const copydir = require('copy-dir')
const { exit } = require('process')

// eslint-disable-next-line no-extend-native
String.prototype.lpad = function (padString, length) {
    let str = this
    while (str.length < length) str = padString + str
    return str.valueOf()
}

const apkName = 'crabo'

let target = process.argv[2]
// TARGET
// pp
// cra

let opt = process.argv[3]
// OPTIONS:
// p => POINT / INIT
// b => BUILD
// s => SIGN APK
// d => DEPLOY APK
// fapk => POINT / INIT / BUILD / SIGN / DEPLOY APK
// fweb => BUILD WEB / DEPLOY WEB
// full => FULL APK / WEB

let mode = process.argv[4]
// Build Type
// d
// r

const defTarget = 'pp'
const targetArr = ['pp', 'cra']
if (!target) target = defTarget

const defOpt = 'full'
const optArr = ['p', 'b', 's', 'd', 'fapk', 'fweb', 'full']
if (!opt) opt = defOpt

const defMode = 'd'
const modeArr = ['d', 'r']
if (!mode) mode = defMode

if (optArr.indexOf(opt) === -1) {
    console.log('ATENCION!')
    console.log('Debe elegir algun parametro: p / b / s / d / fapk / fweb / full')
    exit()
}
let newVersionName$ = ''

switch (opt) {
    case 'p':
        pointTo()
        updateVersionPkg()
        initAndroid()
        break

    case 'b':
        buildApk()
        break

    case 's':
        signApk()
        break

    case 'd':
        deployApk()
        break

    case 'fapk':
        pointTo()
        updateVersionPkg()
        initAndroid()
        buildApk()
        signApk()
        deployApk()
        break

    case 'fweb':
        buildWeb()
        deployWeb()
        break

    case 'full':
        pointTo()
        updateVersionPkg()
        initAndroid()
        buildApk()
        signApk()
        deployApk()
        buildWeb()
        deployWeb()
        console.log('#############################')
        console.log('VERSION crabo.apk:  ' + newVersionName$)
        console.log('#############################')
        break
}

function pointTo () {
    console.log('')
    console.log('')
    console.log('#########################')
    console.log('INCREMENT VERSION')
    console.log('#########################')
    console.log('')

    /// /////////////////////////////////////////////////////////////////////////////
    // Actualiza environments file
    /// /////////////////////////////////////////////////////////////////////////////
    console.log('==============================')
    const bufferEnv = fs.readFileSync(path.join(__dirname, '/src/environments.js'))
    let strEnv = bufferEnv.toString()

    const reg = /(versionName: ')(([0-9]{1}.[0-9]{1,2}.)([0-9]{2}))/gm
    strEnv = strEnv.replace(reg, ($0, $1, $2, $3, $4) => {
        const buildNum$ = (Number($4) + 1).toString().lpad('0', 2)
        newVersionName$ = $3 + buildNum$
        console.log($2 + ' => ' + newVersionName$)
        const match = $1 + newVersionName$
        return match
    })
    fs.writeFileSync(path.join(__dirname, '/src/environments.js'), strEnv, err => {
        if (err === null) {
            console.log('Actualizacion environments.js OK')
        } else {
            console.log('Error actualizando environments.js: ', err)
        }
    })
}
function updateVersionPkg () {
    /// /////////////////////////////////////////////////////////////////////////////
    // Actualiza package.json => version
    /// /////////////////////////////////////////////////////////////////////////////
    const bufPkg = fs.readFileSync(path.join(__dirname, '/package.json'))
    const strPkg = bufPkg.toString()
    const pkgJson = JSON.parse(strPkg)
    pkgJson.version = newVersionName$

    fs.writeFileSync(path.join(__dirname, '/package.json'), JSON.stringify(pkgJson), err => {
        if (err === null) { console.log('Actualizacion package.json version') } else { console.log('Error actualizando package.json version: ', err) }
    })

    /// /////////////////////////////////////////////////////////////////////////////////
    // Actualizar environments.js
    /// /////////////////////////////////////////////////////////////////////////////////
    console.log(`Copiando => /deploy/${target}/environments.js`)
    fs.copyFileSync(
        path.join(__dirname, `/deploy/${target}/environments.js`),
        path.join(__dirname, '/src/environments.js')
    )

    /// /////////////////////////////////////////////////////////////////////////////////
    // Actualizar firebase.json
    /// /////////////////////////////////////////////////////////////////////////////////
    console.log(`Copiando => /deploy/${target}/firebase.json`)
    fs.copyFileSync(
        path.join(__dirname, `/deploy/${target}/firebase.json`),
        path.join(__dirname, '/firebase.json')
    )

    /// /////////////////////////////////////////////////////////////////////////////////
    // Actualizar serviceWorker
    /// /////////////////////////////////////////////////////////////////////////////////
    console.log(`Copiando => /deploy/${target}/firebase-messaging-sw.js`)
    fs.copyFileSync(
        path.join(__dirname, `/deploy/${target}/firebase-messaging-sw.js`),
        path.join(__dirname, '/public/firebase-messaging-sw.js')
    )
}
function initAndroid () {
    /// /////////////////////////////////////////////////////////////////////////////////
    // Actualizar en android/app/src/main/AndroidManifext.xml
    /// /////////////////////////////////////////////////////////////////////////////////
    console.log(`Copiando => /deploy/${target}/AndroidManifest.xml`)
    fs.copyFileSync(
        path.join(__dirname, `/deploy/${target}/AndroidManifest.xml`),
        path.join(__dirname, '/android/app/src/main/AndroidManifest.xml')
    )

    /// /////////////////////////////////////////////////////////////////////////////////
    // Actualizar en android/variables.gradle
    /// /////////////////////////////////////////////////////////////////////////////////
    console.log(`Copiando => /deploy/${target}/variables.gradle`)
    fs.copyFileSync(
        path.join(__dirname, `/deploy/${target}/variables.gradle`),
        path.join(__dirname, '/android/variables.gradle')
    )

    /// /////////////////////////////////////////////////////////////////////////////////
    // Actualizar en google-services.json
    /// /////////////////////////////////////////////////////////////////////////////////
    console.log(`Copiando => /deploy/${target}/google-services.json`)
    fs.copyFileSync(
        path.join(__dirname, `/deploy/${target}/google-services.json`),
        path.join(__dirname, '/android/app/src/google-services.json')
    )

    /// /////////////////////////////////////////////////////////////////////////////////
    // Actualizar en android/strings.xml
    /// /////////////////////////////////////////////////////////////////////////////////
    console.log(`Copiando => /deploy/${target}/strings.xml`)
    fs.copyFileSync(
        path.join(__dirname, `/deploy/${target}/strings.xml`),
        path.join(__dirname, '/android/app/src/main/res/values/strings.xml')
    )

    /// /////////////////////////////////////////////////////////////////////////////////
    // Actualizar en android/app/build.gradle => versionCode y versionName
    /// /////////////////////////////////////////////////////////////////////////////////
    // console.log('==============================')
    // console.log('Lee build.gradle')
    // const bufGradle = fs.readFileSync(path.join(__dirname, '/android/app/build.gradle'))
    // let strGradle = bufGradle.toString()

    // const newVersionCode = generateVersionCode(newVersionName$)
    // const regVerCode = /(versionCode\s)([0-9]{5})/gm
    // strGradle = strGradle.replace(regVerCode, ($0, $1) => {
    //    // console.log('$0', $0) // versionCode 10102
    //    // console.log('$1', $1) // versionCode
    //    // console.log('$2', $2) // 10102
    //    console.log('new versionCode => ' + newVersionCode)
    //    const match = $1 + newVersionCode
    //    return match
    // })

    // const regVerName = /(versionName\s")[0-9].[0-9]{2}.[0-9]{2}/gm
    // strGradle = strGradle.replace(regVerName, ($0, $1) => {
    //    const match = $1 + newVersionName$
    //    console.log('new versionName => ' + newVersionName$)
    //    return match
    // })

    // console.log('Actualiza build.gradle')
    // console.log('path :', path.join(__dirname, '/android/app/build.gradle'))
    // fs.writeFileSync(path.join(__dirname, '/android/app/build.gradle'), strGradle, err => {
    //    if (err === null) { console.log('Actualizacion build.gradle OK') } else { console.log('Error actualizando build.gradle: ', err) }
    // })
    /// /////////////////////////////////////////////////////////////////////
    // Actualiza AppName strings.xml
    /// ///////////////////////////////////////////////////////////
    // console.log('==============================')
    // console.log('Lee strings.xml')
    // const bufStrings = fs.readFileSync(path.join(__dirname, '/android/app/src/main/res/values/strings.xml'))
    // let strStrings = bufStrings.toString()

    // let appName
    // const appNm = apkName.charAt(0).toUpperCase() + apkName.slice(1)

    // const regAppName = 'app_name">(.*)<'
    // const lblApp = '"app_name"'
    // strStrings = strStrings.replace(lblApp + '>' + strStrings.match(regAppName)[1] + '<', lblApp + '>' + appNm + '<')

    // const regAppActName = 'title_activity_main">(.*)<'
    // const lblAct = '"title_activity_main"'
    // strStrings = strStrings.replace(lblAct + '>' + strStrings.match(regAppActName)[1] + '<', lblAct + '>' + appNm + '<')

    // console.log('new APP NAME:', appName)
    // console.log('new ACTIVITY NAME:', appName)

    // fs.writeFileSync(path.join(__dirname, '/android/app/src/main/res/values/strings.xml'), strStrings, err => {
    //    if (err === null) { console.log('Actualizacion strings.xml OK') } else { console.log('Error actualizando strings.xml: ', err) }
    // })
}
function buildApk () {
    /// /////////////////////////////////////////////////////////////////////////////
    // Generate DIST (quasar build)
    /// /////////////////////////////////////////////////////////////////////////////
    console.log('Build project')
    console.log('................')
    buildWeb()

    /// /////////////////////////////////////////////////////////////////////////////
    // SYNC data to android
    /// /////////////////////////////////////////////////////////////////////////////
    console.log('Sync to android')
    console.log('................')
    execSync('npx cap sync android', {
        stdio: 'inherit'
    })

    /// /////////////////////////////////////////////////////////////////////////////
    // GENERA nueva APK
    /// /////////////////////////////////////////////////////////////////////////////
    console.log('Genera nueva apk')
    console.log('................')
    process.chdir('android')
    console.log('Cambia a carpeta => android')
    console.log('...........................')

    if (mode === 'r') {
        console.log('Building apk unsigned')
        console.log('.....................')
        execSync('./gradlew assembleRelease', {
            stdio: 'inherit'
        })
    }

    if (mode === 'd') {
        console.log('Building apk debug')
        console.log('...................')
        execSync('./gradlew assembleDebug', {
            stdio: 'inherit'
        })
    }

    process.chdir('..')
    console.log('Vuelve a carpeta proyecto')
}
function signApk () {
    /// /////////////////////////////////////////////////////////////////////////////
    // SIGN nueva APK
    /// /////////////////////////////////////////////////////////////////////////////
    if (mode === 'r') {
        try {
            const apkPath = `./android/app/build/outputs/apk/release/${apkName}.apk`
            fs.unlinkSync(apkPath)
        } catch (error) {
            console.log('apk does not exist!!')
        }

        const buildToolsPath = '$ANDROID_HOME/build-tools/31.0.0/'

        console.log('Ejecuta zipalign')
        execSync(`${buildToolsPath}zipalign -v 4 ./android/app/build/outputs/apk/release/app-release-unsigned.apk ./android/app/build/outputs/apk/release/${apkName}.apk`, {
            stdio: 'inherit'
        })

        console.log('Ejectua apksigner')
        execSync(`${buildToolsPath}apksigner sign --ks keystore.jks --ks-pass pass:"Telecom.01" ./android/app/build/outputs/apk/release/${apkName}.apk`, {
            stdio: 'inherit'
        })
    } else {
        console.log('apk modo debug NOT signed process....')
    }
}
function deployApk () {
    console.log('')
    console.log('')
    console.log('######################')
    console.log('DEPLOY TO Firebase')
    console.log('######################')

    /// /////////////////////////////////////////////////////////////////////////////
    // COPIA APK al destino
    /// /////////////////////////////////////////////////////////////////////////////
    const dest = `/Users/pablin/My Drive/pp/P♡P/P&P Soft/CRA/${apkName}.apk`
    console.log('Copiando apk a: ', dest)
    if (mode === 'r') {
        fs.copyFileSync(
            `./android/app/build/outputs/apk/release/${apkName}.apk`,
            dest
        )
    }
    if (mode === 'd') {
        fs.copyFileSync(
            './android/app/build/outputs/apk/debug/app-debug.apk',
            dest
        )
    }

    console.log('##############')
    console.log('FIN SCRIPT APK')
    console.log('##############')
}
function buildWeb () {
    /// /////////////////////////////////////////////////////////////////////////////
    // BUILD WEB => DIST
    /// /////////////////////////////////////////////////////////////////////////////
    execSync('npm i', { stdio: 'inherit' })

    if (mode === 'r') {
        execSync('quasar build', {
            stdio: 'inherit'
        })
    }
    if (mode === 'd') {
        execSync('quasar build --debug', {
            stdio: 'inherit'
        })
    }
    console.log('build Web OK')
}
function deployWeb () {
    console.log('')
    console.log('')
    console.log('###########################')
    console.log('DEPLOY APK TO WEBSITE ')
    console.log('###########################')

    /// /////////////////////////////////////////////////////////////////////////////
    // PUBLICA SPA EN SITIO DESTINO
    /// /////////////////////////////////////////////////////////////////////////////
    execSync('firebase deploy --only hosting', {
        stdio: 'inherit'
    })
    console.log('##############')
    console.log('FIN SCRIPT WEB')
    console.log('##############')
}
function generateVersionCode (vn) {
    const nums = vn.split('.') // vn.split('-')[0].split('.')
    let vc = 0
    if (+nums[0]) {
        vc += +nums[0] * 10000
    }
    if (+nums[1]) {
        vc += +nums[1] * 100
    }
    if (+nums[2]) {
        vc += +nums[2]
    }
    console.log('versionCode: ' + vc)
    return vc
}
