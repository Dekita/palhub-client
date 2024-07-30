/**
 * colors.js
 * author: dekitarpg@gmail.com
 * contains various colors that I like in a handy object.
 */
const COLORS = {
    // base colors i like
    white: '#e4e4e4', //note: not pure
    black: '#040404', //note: not pure
    // discord branding colors (2022)
    discord: {
        blurple: '#5865F2',
        green: '#57F287',
        yellow: '#FEE75C',
        fuchsia: '#EB459E',
        red: '#ED4245',
        white: '#FFFFFF',
        black: '#000000',
    },
    // light.hue[1..36] and light.chroma[1..36]
    // 1 for each 10% shift in hue. 36 is 360% or 0%
    light: {
        hue: {
            // regular hue saturation shift0
            1: '#328CC1',
            2: '#3274c1',
            3: '#325cc1',
            4: '#3245c1',
            5: '#3732c1',
            6: '#4f32c1',
            7: '#6732c1',
            8: '#7f32c1',
            9: '#9732c1',
            10: '#af32c1',
            11: '#c132bc',
            12: '#c132a4',
            13: '#c1328d',
            14: '#c13275',
            15: '#c1325d',
            16: '#c13245',
            17: '#c13832',
            18: '#c14f32',
            19: '#c16732',
            20: '#c17f32',
            21: '#c19732',
            22: '#c1ae32',
            23: '#bcc132',
            24: '#a4c132',
            25: '#8cc132',
            26: '#74c132',
            27: '#5cc132',
            28: '#44c132',
            29: '#32c137',
            30: '#32c14f',
            31: '#32c166',
            32: '#32c17e',
            33: '#32c196',
            34: '#32c1ae',
            35: '#32bbc1',
            36: '#32a4c1',
        },
        chroma: {
            // pastel like hue shift
            1: '#328CC1',
            2: '#4889c4',
            3: '#5c86c6',
            4: '#6e82c5',
            5: '#7e7ec2',
            6: '#8c79be',
            7: '#9975b7',
            8: '#a571af',
            9: '#ae6da6',
            10: '#b66a9c',
            11: '#bb6891',
            12: '#bf6886',
            13: '#c1687b',
            14: '#c06970',
            15: '#be6a64',
            16: '#ba6e5b',
            17: '#b57252',
            18: '#ae754a',
            19: '#a67a45',
            20: '#9e7e41',
            21: '#94823f',
            22: '#89863f',
            23: '#7e8942',
            24: '#718b45',
            25: '#658e4d',
            26: '#579056',
            27: '#48925f',
            28: '#37936a',
            29: '#249475',
            30: '#089582',
            31: '#00958d',
            32: '#009498',
            33: '#0093a2',
            34: '#0092ac',
            35: '#0091b5',
            36: '#108ebb',
        },
    },
    // dark.hue[1..36] and dark.chroma[1..36]
    // 1 for each 10% shift in hue. 36 is 360% or 0%
    dark: {
        hue: {
            // regular hue saturation shift0
            1: '#215c7e',
            2: '#214d7e',
            3: '#213d7e',
            4: '#212e7e',
            5: '#24217e',
            6: '#34217e',
            7: '#43217e',
            8: '#53217e',
            9: '#62217e',
            10: '#72217e',
            11: '#7e217c',
            12: '#7e216c',
            13: '#7e215d',
            14: '#7e214d',
            15: '#7e213d',
            16: '#7e212e',
            17: '#7e2421',
            18: '#7e3421',
            19: '#7e4321',
            20: '#7e5221',
            21: '#7e6221',
            22: '#7e7121',
            23: '#7b7e21',
            24: '#6b7e21',
            25: '#5c7e21',
            26: '#4c7e21',
            27: '#3d7e21',
            28: '#2d7e21',
            29: '#217e23',
            30: '#217e33',
            31: '#217e42',
            32: '#217e52',
            33: '#217e62',
            34: '#217e71',
            35: '#217b7e',
            36: '#216b7e',
        },
        chroma: {
            // pastel like hue shift
            1: '#215c7e',
            2: '#2f5a80',
            3: '#3b5882',
            4: '#465581',
            5: '#515380',
            6: '#5b507d',
            7: '#634d79',
            8: '#6b4a74',
            9: '#71486e',
            10: '#764667',
            11: '#7a4560',
            12: '#7d4459',
            13: '#7e4351',
            14: '#7f454a',
            15: '#7d4643',
            16: '#7b473c',
            17: '#784a36',
            18: '#734c32',
            19: '#6e4f2d',
            20: '#68522b',
            21: '#625529',
            22: '#5a5729',
            23: '#54592b',
            24: '#4b5b2e',
            25: '#435d31',
            26: '#3a5e36',
            27: '#325f3d',
            28: '#286044',
            29: '#1e614c',
            30: '#106253',
            31: '#00615a',
            32: '#006263',
            33: '#00616a',
            34: '#006070',
            35: '#005f76',
            36: '#115d79',
        },
    },
};

// safediff[0..11] || safedark[0..11]
// creates array of colors that are a few tones apart.
// this is extremely useful for graphs and charts etc.
COLORS.safediff = [];
COLORS.safedark = [];
Object.keys(COLORS.light.hue).forEach((key, index) => {
    if (index % 3 !== 0) return;
    COLORS.safediff.push(COLORS.light.hue[key]);
    COLORS.safedark.push(COLORS.dark.hue[key]);
});

if (module && module.exports) {
    module.exports = COLORS;
}
