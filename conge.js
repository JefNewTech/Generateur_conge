try {
    const {
        PDFDocument,
        StandardFonts
    } = PDFLib
    const $ = (...args) => document.querySelector(...args);

    const $$ = (...args) => document.querySelectorAll(...args);
    let canvas = document.getElementById("field-signature");
    let signaturePad = new SignaturePad(canvas);

    document.getElementById("reset-signature").addEventListener("click", () => signaturePad.clear());

    function getSignature() {
        const signatureData = signaturePad.toDataURL();
        return signatureData;

    }


    async function getProfile() {
        const fields = {}
        fields.signature = await fetch(getSignature()).then(res => res.arrayBuffer());
        fields.nom = document.getElementById("field-nom").value;
        fields.debut = new Date(document.getElementById("field-debut").value).toLocaleDateString('fr-FR');
        fields.fin = new Date(document.getElementById("field-fin").value).toLocaleDateString('fr-FR');
        console.log(fields);
        return fields
    }

    async function generatePdf(profile, reason) {
        const pdfBase = 'Conge.pdf'

        const creationInstant = new Date();
        const creationDate = creationInstant.toLocaleDateString('fr-FR');

        const {
            name,
            debut,
            fin
        } = profile

        const existingPdfBytes = await fetch(pdfBase).then((res) => res.arrayBuffer());

        const pdfDoc = await PDFDocument.load(existingPdfBytes);
        const signatureImageByte = await pdfDoc.embedPng(profile.signature);
        const page = pdfDoc.getPages()[0]

        const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
        const drawText = (text, x, y, size = 11) => {
            page.drawText(text, {
                x,
                y,
                size,
                font
            })
        }
        const drawImage = (images, x, y, width, height) => {
            page.drawImage(images, {
                x: x,
                y: y,
                width: width,
                height: height,
            })


        }
        drawImage(signatureImageByte, 350, 110, 120, 30)
        drawText(profile.nom, 180, 235, 12)
        if (profile.fin != '') {
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
                drawText('d un congé pour grève', 25, 200, 15)
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
        var url = URL.createObjectURL(blob)
        link.href = url
        link.download = fileName
        link.click()
    }

    function getReason() {
        const val = $('input[name="field-reason"]:checked').value
        return val
    }

    $('#generate-btn').addEventListener('click', async (event) => {

        const reason = getReason();
        const pdfBlob = await generatePdf(await getProfile(), reason);
        const nom = document.getElementById("field-nom").value;
        const date = new Date(document.getElementById("field-debut").value).toLocaleDateString('fr-FR');

        if (document.getElementById("field-nom").value == "") {
            alert("Comment veut-tu que l'on sache qui prend congé si tu n'indique pas ton nom!");
            document.getElementById("field-nom").focus();
            return false
        } else if (document.getElementById("field-debut").value == "") {
            alert("Comment veut-tu que l'on sache quand tu prend congé si tu n'indique la date!");
            document.getElementById("field-debut").focus();
            return false
        } else {
            downloadBlob(pdfBlob, `${nom}_${reason}_${date}.pdf`);
        }

//            snackbar.classList.remove('d-none')
//            setTimeout(() => snackbar.classList.add('show'), 100)
//
//            setTimeout(function () {
//                snackbar.classList.remove('show')
//                setTimeout(() => snackbar.classList.add('d-none'), 500)
//            }, 6000) 
    })
    

} catch (err) {
    console.log(err)
}