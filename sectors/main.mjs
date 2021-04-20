export default function sectorCoords(alpha, R, n) {
    let coords = [];
    alpha =  alpha * Math.PI / 180;
    for(let i=0; i < (n+1); i++) {
        let gamma = -1 * 90 * Math.PI / 180 - alpha * (0.5 - i / n);
        let x = Math.cos(gamma) * R;
        let y = Math.sin(gamma) * R;
        coords[i] = [x, y];
    }
    return coords;
}