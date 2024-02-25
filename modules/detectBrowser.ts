type Browser = 'Google Chrome' | 'Microsoft Edge' | 'Opera' | 'UnknownBrowser'

const detectBrowser = (userAgent: string | string[]): Browser => {
    if (userAgent.includes('Chrome')) {
        return 'Google Chrome';
    } else if (userAgent.includes('Edg')) {
        return 'Microsoft Edge';
    } else if (userAgent.includes('OPR') || userAgent.includes('Opera')) {
        return 'Opera';
    } else {
        return 'UnknownBrowser';
    }
}

export default detectBrowser;