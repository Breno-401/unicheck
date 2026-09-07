(function () {
    "use strict";

    const multiatendimento = Object.freeze({
        label: "(27) 9 8123 4566",
        href: "https://wa.me/5527981234566"
    });

    const contacts = Object.freeze({
        email: Object.freeze({
            label: "atendimento@salesiano.br",
            href: "mailto:atendimento@salesiano.br"
        }),
        multiatendimento,
        institutionalPortal: Object.freeze({
            label: "Acessar UniSales",
            href: "https://unisales.br/"
        })
    });

    window.UniCheckContacts = contacts;
    window.UniCheckSupportChannels = Object.freeze({
        email: contacts.email,
        whatsapp: contacts.multiatendimento,
        institutionalPortal: contacts.institutionalPortal
    });
})();
