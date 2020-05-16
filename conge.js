import 'bootstrap/dist/css/bootstrap.min.css'
const {
    PDFDocument,
    StandardFonts
} = PDFLib

const $ = (...args) => document.querySelector(...args)
const $$ = (...args) => document.querySelectorAll(...args)

import pdfBase from './Conge.pdf'

function getFormattedDate(date) {
    const year = date.getFullYear()
    const month = pad(date.getMonth() + 1) // Les mois commencent à 0
    const day = pad(date.getDate())
    return `${year}-${month}-${day}`
}

document.addEventListener('DOMContentLoaded', setReleaseDateTim)

function setReleaseDateTime() {
    const releaseDateInput = $('#date')
    const loadedDate = new Date()
    releaseDateInput.value = getFormattedDate(loadedDate)
}

function getProfile() {
    const fields = {}
    for (const field of $$('#form-profile input')) {
        if (field.id === 'field-debut') {
            const debut = field.value.split('-')
            fields[field.id.substring('field-'.length)] = `${debut[2]}/${debut[1]}`
        } else {
            fields[field.id.substring('field-'.length)] = field.value
        }
    }
    return fields
}

function idealFontSize(font, text, maxWidth, minSize, defaultSize) {
    let currentSize = defaultSize
    let textWidth = font.widthOfTextAtSize(text, defaultSize)

    while (textWidth > maxWidth && currentSize > minSize) {
        textWidth = font.widthOfTextAtSize(text, --currentSize)
    }

    return textWidth > maxWidth ? null : currentSize
}

async function generatePdf(profile, reason) {
    const creationInstant = new Date()
    const creationDate = creationInstant.toLocaleDateString('fr-FR')

    const {
        nom,
        debut,
        fin,
    } = profile

    const data = [
        'Je sousigné: ${nom}',
        'octroi: ${reason}',
        '${debut} au ${fin}',
    ].join(';\n')

    const existingPdfBytes = await fetch(pdfBase).then((res) => res.arrayBuffer())

    const pdfDoc = await PDFDocument.load(existingPdfBytes)

    // set pdf metadata
    pdfDoc.setTitle('Feuille de congé')
    pdfDoc.setAuthor('JefNewTech')

    const page1 = pdfDoc.getPages()[0]

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const drawText = (text, x, y, size = 11) => {
        page.drawText(text, {
            x,
            y,
            size,
            font
        })
    }

    drawText(profile.name, 180, 235, 12)
    if (profile.fin !== '') {
        drawText(`Du ${profile.debut}`, 25, 180)
        drawText(`au ${profile.fin}`, 120, 180)
    } else {
        drawText(`Le ${profile.debut}`, 25, 180)
    }

    switch (reason) {
        case 'VaAn':
            drawText('de vacance annuelle', 25, 200, 15)
            break
        case 'ReHs':
            drawText('de récupération d heures supplémentaires', 25, 200, 15)
            break
        case 'CoCi':
            drawText('d un congé de Circonstance', 25, 200, 15)
            break
        case 'CoFmp':
            drawText('d un congé pour force majeur payé ( 4jours)', 25, 200, 15)
            break
        case 'CoFmNp':
            drawText('d un congé pour force majeur non payé ( 6jours)', 25, 200, 15)
            break
        case 'COMiC':
            drawText('d un congé pour motif imperieux (Contractuel)', 25, 200, 15)
            break
        case 'COMIS':
            drawText('d un congé pour motif imperieux (Statutaire)', 25, 200, 15)
            break
        case 'CoPa':
            drawText('d un congé Syndical', 25, 200, 15)
            break
        case 'DisCm':
            drawText('d une dispense de Service Convocation médical', 25, 200, 15)
            break
        case 'DisDo':
            drawText('d une dispense de Service Don de moelle, Organe', 25, 200, 15)
            break
        case 'DisDp':
            drawText('d une dispense de Service Don de plaquettes', 25, 200, 15)
            break
        case 'DisDs':
            drawText('d une dispense de Service Don de Sang', 25, 200, 15)
            break
        case 'DisRm':
            drawText('d une dispense de Service RDV médical Service', 25, 200, 15)
            break
        case 'EnGr':
            drawText('d un congé pour greve', 25, 200, 15)
            break
        case 'FoPr':
            drawText('d un congé pour formation professionnelle', 25, 200, 15)
            break
        case 'JoVe':
            drawText('d un jour vert', 25, 200, 15)
            break
        case 'Mala':
            drawText('d un congé pour maladie', 25, 200, 15)
            break
        case 'MiEx':
            drawText('d un congé pour mission exterieur', 25, 200, 15)
            break
        case 'MiTime':
            drawText('d un congé pour mi-temps médical', 25, 200, 15)
            break
    }
    if (reason !== '') {
        const date = [
      String((new Date).getDate()).padStart(2, '0'),
      String((new Date).getMonth() + 1).padStart(2, '0'),
      String((new Date).getFullYear()),
    ].join('/')

        drawText(date, 405, 354)
    }

    const pdfBytes = await pdfDoc.save()

    return new Blob([pdfBytes], {
        type: 'application/pdf'
    })
}

function downloadBlob(blob, fileName) {
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
}

function getReason() {
    const {
        value
    } = $('input[name="field-reason"]:checked')
    localStorage.setItem('last-reason', value)
    return value
}

const snackbar = $('#snackbar')

$('#generate').addEventListener('click', async (event) => {
event.preventDefault()
const invalid = validateAriaFields()
if (invalid) return

const reason = getReason()
const pdfBlob = await generatePdf(getProfile(), reason)

const creationInstant = new Date()
const creationDate = creationInstant.toLocaleDateString('fr-FR')
const creationHour = creationInstant
    .toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
    })
    .replace(':', '-')
downloadBlob(pdfBlob, `Feuille-${creationDate}_${creationHour}.pdf`)

snackbar.classList.remove('d-none')
setTimeout(() => snackbar.classList.add('show'), 100)

setTimeout(function () {
    snackbar.classList.remove('show')
    setTimeout(() => snackbar.classList.add('d-none'), 500)
}, 6000)
})
})

$$('input').forEach((input) => {
    const exempleElt = input.parentNode.parentNode.querySelector('.exemple')
    const validitySpan = input.parentNode.parentNode.querySelector('.validity')
    if (input.placeholder && exempleElt) {
        input.addEventListener('input', (event) => {
            if (input.value) {
                exempleElt.innerHTML = 'ex.&nbsp;: ' + input.placeholder
                validitySpan.removeAttribute('hidden')
            } else {
                exempleElt.innerHTML = ''
            }
        })
    }
})

const conditions = {
    '#nom': {
        condition: 'length',
    },
    '#debut': {
        condition: 'pattern',
        pattern: /\d{4}-\d{2}-\d{2}/g,
    },
    '#fin': {
        condition: 'pattern',
        pattern: /\d{4}-\d{2}-\d{2}/g,
    },
}

function validateAriaFields() {
    return Object.keys(conditions).map(field => {
        if (conditions[field].condition === 'pattern') {
            const pattern = conditions[field].pattern
            if ($(field).value.match(pattern)) {
                $(field).setAttribute('aria-invalid', 'false')
                return 0
            } else {
                $(field).setAttribute('aria-invalid', 'true')
                $(field).focus()
                return 1
            }
        }
        if (conditions[field].condition === 'length') {
            if ($(field).value.length > 0) {
                $(field).setAttribute('aria-invalid', 'false')
                return 0
            } else {
                $(field).setAttribute('aria-invalid', 'true')
                $(field).focus()
                return 1
            }
        }
    }).some(x => x === 1)
}