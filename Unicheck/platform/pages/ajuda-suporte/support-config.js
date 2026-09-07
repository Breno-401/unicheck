// Compatibilidade para integrações que ainda carreguem este arquivo diretamente.
// A fonte canônica fica em platform/shared/js/support-channels.js.
if (!window.UniCheckSupportChannels && window.UniCheckContacts) {
    window.UniCheckSupportChannels = Object.freeze({
        email: window.UniCheckContacts.email,
        whatsapp: window.UniCheckContacts.multiatendimento,
        institutionalPortal: window.UniCheckContacts.institutionalPortal
    });
}
