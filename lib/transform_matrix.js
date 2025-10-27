export function createIdentity() {
    var identitas = [
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1]
    ];
    return identitas;
}

export function multiplyMatrices(m1, m2) {
    var hasil = [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0]
    ];

    for (var i = 0; i < 3; i++) {
        for (var j = 0; j < 3; j++) {
            for (var k = 0; k < 3; k++) {
                hasil[i][k] += m1[i][j] * m2[j][k];
            }
        }
    }
    return hasil;
}

export function createTranslation(tx, ty) {
    var translasi = [
        [1, 0, tx],
        [0, 1, ty],
        [0, 0, 1]
    ];
    return translasi;

}

export function createScale(sx, sy) {
    var skala = [
        [sx, 0, 0],
        [0, sy, 0],
        [0, 0, 1]
    ];
    return skala;

}

export function createRotation(theta) {
    var rotasi = [
        [Math.cos(theta), -Math.sin(theta), 0],
        [Math.sin(theta), Math.cos(theta), 0],
        [0, 0, 1]
    ];
    return rotasi;

}

export function rotation_fp(xc, yc, theta) {
    var m1 = createTranslation(-xc, -yc);
    var m2 = createRotation(theta);
    var m3 = createTranslation(xc, yc);

    var hasil;
    hasil = multiplyMatrices(m2, m1);
    hasil = multiplyMatrices(m3, hasil);

    return hasil;
}

export function scale_fp(xc, yc, sx, sy) {
    var m1 = createTranslation(-xc, -yc);
    var m2 = createScale(sx, sy);
    var m3 = createTranslation(xc, yc);

    var hasil;
    hasil = multiplyMatrices(m2, m1);
    hasil = multiplyMatrices(m3, hasil);

    return hasil;
}

export function transformPoint(matrix, titik_lama) {


    var x_baru = matrix[0][0] * titik_lama.x + matrix[0][1] * titik_lama.y + matrix[0][2] * 1;
    var y_baru = matrix[1][0] * titik_lama.x + matrix[1][1] * titik_lama.y + matrix[1][2] * 1;

    return { x: x_baru, y: y_baru };

}

export function transform_array(array_titik, matrix) {
    var hasil = [];
    for (var i = 0; i < array_titik.length; i++) {
        var titik_hasil = transformPoint(matrix, array_titik[i]);
        hasil.push(titik_hasil);
    }
    return hasil;
}   