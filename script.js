const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let width;
let height;


/* =====================================================
   CONFIGURACIÓN
   ===================================================== */

const CONFIG = {

    // Duración de los fuegos automáticos
    DURACION_FUEGOS: 150000, // 2 minutos 30 segundos

    // Cada cuánto aparece un nuevo fuego
    INTERVALO_FUEGOS: 700,

    // Cantidad máxima de estrellas
    ESTRELLAS: 260,

    // Límite de partículas
    MAX_PARTICULAS: 4500,

    // Gravedad
    GRAVEDAD: 0.035,

    // Fricción
    FRICCION: 0.985

};


/* =====================================================
   ARRAYS
   ===================================================== */

const stars = [];
const fireworks = [];
const particles = [];


/* =====================================================
   CONTROL DEL ESPECTÁCULO
   ===================================================== */

const inicioEspectaculo = Date.now();

let fuegosAutomaticosActivos = true;


/* =====================================================
   CANVAS
   ===================================================== */

function ajustarCanvas() {

    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;

}

window.addEventListener(
    "resize",
    ajustarCanvas
);

ajustarCanvas();


/* =====================================================
   ESTRELLAS
   ===================================================== */

class Star {

    constructor() {

        this.x =
            Math.random() * width;

        this.y =
            Math.random() * height;

        this.radius =
            Math.random() * 1.5 + 0.2;

        this.alpha =
            Math.random() * 0.7 + 0.2;

        this.speed =
            Math.random() * 0.02 + 0.005;

        this.direction =
            Math.random() > 0.5
                ? 1
                : -1;

    }


    update() {

        this.alpha +=
            this.speed *
            this.direction;

        if (this.alpha >= 1) {

            this.alpha = 1;

            this.direction = -1;

        }

        if (this.alpha <= 0.15) {

            this.alpha = 0.15;

            this.direction = 1;

        }

    }


    draw() {

        ctx.beginPath();

        ctx.arc(
            this.x,
            this.y,
            this.radius,
            0,
            Math.PI * 2
        );

        ctx.fillStyle =
            `rgba(
                255,
                245,
                200,
                ${this.alpha}
            )`;

        ctx.fill();

    }

}


/* Crear estrellas */

for (
    let i = 0;
    i < CONFIG.ESTRELLAS;
    i++
) {

    stars.push(
        new Star()
    );

}


/* =====================================================
   FUEGO ARTIFICIAL
   ===================================================== */

class Firework {

    constructor(
        x,
        targetY
    ) {

        this.x = x;

        this.y = height + 10;

        this.targetY = targetY;

        this.speed =
            7 +
            Math.random() * 2.5;

        this.exploded = false;

        this.trail = [];

    }


    update() {

        if (this.exploded) {
            return;
        }


        /* Guardar trayectoria */

        this.trail.push({
            x: this.x,
            y: this.y
        });


        if (this.trail.length > 10) {

            this.trail.shift();

        }


        /* Subir */

        this.y -= this.speed;

        this.speed *= 0.992;


        /* Explosión */

        if (
            this.y <= this.targetY
        ) {

            this.explode();

        }

    }


    draw() {

        if (this.exploded) {
            return;
        }


        /* Cola */

        for (
            let i = 0;
            i < this.trail.length;
            i++
        ) {

            const punto =
                this.trail[i];

            const alpha =
                i / this.trail.length;

            ctx.beginPath();

            ctx.arc(
                punto.x,
                punto.y,
                1.4,
                0,
                Math.PI * 2
            );

            ctx.fillStyle =
                `rgba(
                    255,
                    190,
                    60,
                    ${alpha}
                )`;

            ctx.fill();

        }


        /* Cabeza */

        ctx.beginPath();

        ctx.arc(
            this.x,
            this.y,
            2.5,
            0,
            Math.PI * 2
        );

        ctx.fillStyle =
            "#fff6bd";

        ctx.shadowBlur = 15;

        ctx.shadowColor =
            "#ffc107";

        ctx.fill();

        ctx.shadowBlur = 0;

    }


    explode() {

        this.exploded = true;

        crearGirasol(
            this.x,
            this.y
        );

    }

}


/* =====================================================
   PARTÍCULA
   ===================================================== */

class Particle {

    constructor(
        x,
        y,
        vx,
        vy,
        color,
        size,
        life
    ) {

        this.x = x;
        this.y = y;

        this.vx = vx;
        this.vy = vy;

        this.color = color;

        this.size = size;

        this.life = life;

        this.maxLife = life;

    }


    update() {

        this.vx *=
            CONFIG.FRICCION;

        this.vy *=
            CONFIG.FRICCION;

        this.vy +=
            CONFIG.GRAVEDAD;

        this.x +=
            this.vx;

        this.y +=
            this.vy;

        this.life--;

    }


    draw() {

        const alpha =
            this.life /
            this.maxLife;

        if (alpha <= 0) {
            return;
        }


        ctx.beginPath();

        ctx.arc(
            this.x,
            this.y,
            this.size,
            0,
            Math.PI * 2
        );

        ctx.fillStyle =
            hexToRgba(
                this.color,
                alpha
            );

        ctx.fill();

    }

}


/* =====================================================
   CREAR GIRASOL
   ===================================================== */

function crearGirasol(x, y) {

    /*
     * Cada explosión tiene una cantidad
     * ligeramente diferente de pétalos.
     */

    const petalos =
        20 +
        Math.floor(
            Math.random() * 8
        );


    const radio =
        50 +
        Math.random() * 35;


    /* -----------------------------------------------
       PÉTALOS
       ----------------------------------------------- */

    for (
        let p = 0;
        p < petalos;
        p++
    ) {

        const angulo =
            (
                Math.PI * 2 /
                petalos
            ) * p;


        /*
         * Menos partículas que antes,
         * pero distribuidas a lo largo
         * del pétalo.
         */

        for (
            let i = 0;
            i < 15;
            i++
        ) {

            const distancia =
                5 +
                (
                    i / 15
                ) * radio;


            const desviacion =
                (
                    Math.random() - 0.5
                ) * 0.10;


            const anguloFinal =
                angulo +
                desviacion;


            /*
             * La velocidad depende
             * de la distancia.
             */

            const velocidad =
                1.0 +
                (
                    distancia /
                    radio
                ) * 1.3;


            const vx =
                Math.cos(
                    anguloFinal
                ) * velocidad;


            const vy =
                Math.sin(
                    anguloFinal
                ) * velocidad;


            let color;


            const aleatorio =
                Math.random();


            if (
                aleatorio < 0.60
            ) {

                color = "#ffd83d";

            } else if (
                aleatorio < 0.82
            ) {

                color = "#ffb52e";

            } else {

                color = "#fff1a3";

            }


            agregarParticula(
                new Particle(
                    x,
                    y,
                    vx,
                    vy,
                    color,
                    1.3 +
                    Math.random() * 1.2,
                    70 +
                    Math.random() * 35
                )
            );

        }

    }


    /* -----------------------------------------------
       CENTRO DEL GIRASOL
       ----------------------------------------------- */

    for (
        let i = 0;
        i < 55;
        i++
    ) {

        const angulo =
            Math.random() *
            Math.PI * 2;


        const velocidad =
            Math.random() * 1.3;


        agregarParticula(
            new Particle(
                x,
                y,
                Math.cos(angulo) *
                    velocidad,
                Math.sin(angulo) *
                    velocidad,
                Math.random() > 0.5
                    ? "#6b3e16"
                    : "#8a5a20",
                1.3,
                70
            )
        );

    }


    /* -----------------------------------------------
       DESTELLO
       ----------------------------------------------- */

    for (
        let i = 0;
        i < 18;
        i++
    ) {

        const angulo =
            Math.random() *
            Math.PI * 2;


        const velocidad =
            2 +
            Math.random() * 2.5;


        agregarParticula(
            new Particle(
                x,
                y,
                Math.cos(angulo) *
                    velocidad,
                Math.sin(angulo) *
                    velocidad,
                "#fff8b8",
                1.8,
                40
            )
        );

    }

}


/* =====================================================
   AGREGAR PARTÍCULA CON LÍMITE
   ===================================================== */

function agregarParticula(
    particle
) {

    /*
     * Evita que el navegador tenga
     * que manejar cantidades excesivas.
     */

    if (
        particles.length <
        CONFIG.MAX_PARTICULAS
    ) {

        particles.push(
            particle
        );

    }

}


/* =====================================================
   LANZAR FUEGO
   ===================================================== */

function lanzarFuego(
    x = null,
    targetY = null
) {

    if (x === null) {

        x =
            width *
            (
                0.08 +
                Math.random() * 0.84
            );

    }


    if (targetY === null) {

        targetY =
            height *
            (
                0.10 +
                Math.random() * 0.42
            );

    }


    fireworks.push(
        new Firework(
            x,
            targetY
        )
    );

}


/* =====================================================
   FUEGOS AUTOMÁTICOS
   ===================================================== */

const intervaloFuegos =
    setInterval(
        () => {

            const tiempoTranscurrido =
                Date.now() -
                inicioEspectaculo;


            /*
             * Después de 2:30:
             * detener fuegos automáticos.
             */

            if (
                tiempoTranscurrido >=
                CONFIG.DURACION_FUEGOS
            ) {

                fuegosAutomaticosActivos =
                    false;

                clearInterval(
                    intervaloFuegos
                );

                return;

            }


            /*
             * Algunas veces salen
             * dos fuegos juntos.
             */

            const cantidad =
                Math.random() < 0.25
                    ? 2
                    : 1;


            for (
                let i = 0;
                i < cantidad;
                i++
            ) {

                setTimeout(
                    () => {

                        if (
                            fuegosAutomaticosActivos
                        ) {

                            lanzarFuego();

                        }

                    },
                    i *
                    (
                        150 +
                        Math.random() * 250
                    )
                );

            }

        },
        CONFIG.INTERVALO_FUEGOS
    );


/* =====================================================
   CLICK MANUAL
   ===================================================== */

canvas.addEventListener(
    "click",
    event => {

        /*
         * El usuario puede seguir
         * lanzando fuegos manualmente
         * incluso después de 2:30.
         */

        lanzarFuego(
            event.clientX,
            event.clientY
        );

    }
);


/* =====================================================
   COLOR HEX → RGBA
   ===================================================== */

function hexToRgba(
    hex,
    alpha
) {

    const numero =
        parseInt(
            hex.replace("#", ""),
            16
        );


    const r =
        (numero >> 16) & 255;


    const g =
        (numero >> 8) & 255;


    const b =
        numero & 255;


    return `
        rgba(
            ${r},
            ${g},
            ${b},
            ${alpha}
        )
    `;

}


/* =====================================================
   ANIMACIÓN
   ===================================================== */

function animar() {

    requestAnimationFrame(
        animar
    );


    /*
     * Fondo semitransparente.
     *
     * Esto deja un pequeño rastro
     * de los fuegos artificiales.
     */

    ctx.fillStyle =
        "rgba(1, 4, 15, 0.20)";

    ctx.fillRect(
        0,
        0,
        width,
        height
    );


    /* -----------------------------------------------
       ESTRELLAS
       ----------------------------------------------- */

    for (
        let i = 0;
        i < stars.length;
        i++
    ) {

        stars[i].update();
        stars[i].draw();

    }


    /* -----------------------------------------------
       FUEGOS
       ----------------------------------------------- */

    for (
        let i = fireworks.length - 1;
        i >= 0;
        i--
    ) {

        const fuego =
            fireworks[i];


        fuego.update();
        fuego.draw();


        if (
            fuego.exploded
        ) {

            fireworks.splice(
                i,
                1
            );

        }

    }


    /* -----------------------------------------------
       PARTÍCULAS
       ----------------------------------------------- */

    for (
        let i = particles.length - 1;
        i >= 0;
        i--
    ) {

        const particle =
            particles[i];


        particle.update();
        particle.draw();


        if (
            particle.life <= 0
        ) {

            particles.splice(
                i,
                1
            );

        }

    }

}


/* =====================================================
   INICIAR
   ===================================================== */

animar();


/* =====================================================
   FUEGOS INICIALES
   ===================================================== */

setTimeout(
    () => lanzarFuego(),
    800
);

setTimeout(
    () => lanzarFuego(),
    1500
);

setTimeout(
    () => lanzarFuego(),
    2300
);

setTimeout(
    () => lanzarFuego(),
    3200
);