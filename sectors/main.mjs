export function sectorCoords(alpha, R, n) {
    let coords = [];
    let alphaRad =  alpha * Math.PI / 180;
    for(let i=0; i < (n+1); i++) {
        let gamma = -1 * 90 * Math.PI / 180 - alphaRad * (0.5 - i / n);
        let x = Math.cos(gamma) * R;
        let y = Math.sin(gamma) * R;
        coords[i] = [x, y, gamma];
    }
    return coords;
}

export function sectorTransforms(alpha, R, n) {
    //TransformedVector = TranslationMatrix * RotationMatrix
    let secCoords = sectorCoords(alpha, R, n);
    let transforms = [];
    for(let i=0; i < n; i++) {
        let translationMatrix = [[1,0,0,secCoords[i][1]], [0,1,0,0], [0,0,1,secCoords[i][0]], [0,0,0,1]];
        let gamma = secCoords[i][2];
        let rotationMatrix = [[Math.cos(gamma), 0, Math.sin(gamma), 0], [0, 1, 0, 0], [-1*Math.sin(gamma), 0, Math.cos(gamma), 0], [0,0,0,1]];
        let resultingMatrix = math.multiply(translationMatrix, rotationMatrix);
        let three4x4Matrix = [];
        for(let j = 0; j < 4; j++)
        {
            three4x4Matrix = three4x4Matrix.concat(...resultingMatrix[j]);
        }
        console.log(three4x4Matrix);
        transforms.push(three4x4Matrix);
    }
    return transforms;
}

export function boxSize(alpha, R, n, aspect) {
    let alphaRad =  alpha * Math.PI / 180;
    let beta = alphaRad / n;
    let W = 2 * R * Math.sin(beta / 2);
    let H = W * aspect;
    return {w: W, h: H};
}