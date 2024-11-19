// Variables para la pelota
let pelotaX, pelotaY;
let velocidadX, velocidadY;
let diametro = 20;

// Variables para las raquetas
let anchoRaqueta = 10, altoRaqueta = 100;
let jugadorX = 20, jugadorY;
let computadoraX, computadoraY;

// Puntuaciones
let puntosJugador = 0;
let puntosComputadora = 0;

// Dimensiones del juego
let anchoCanvas = 800, altoCanvas = 400;

// Variables para los estados del juego
let jugando = false; // Indica si el juego está en marcha
let dificultad = "medio"; // Dificultad predeterminada
let velocidadcomputadora = 1; // Dificultad predeterminada

let anguloGiro = 0; // Ángulo inicial de rotación
let velocidadGiro = 0; // Velocidad de giro en función de la velocidad de la pelota

// Variables para imágenes
let fondo, barraJugador, barraComputadora, bola;

// Variable para almacenar los sonidos
let sonidoColision;
let sonidoGol;

function preload() {
    fondo = loadImage("Sprites/fondo2.png"); // Carga la imagen de fondo
    barraJugador = loadImage("Sprites/barra1.png"); // Imagen de la raqueta del jugador
    barraComputadora = loadImage("Sprites/barra2.png"); // Imagen de la raqueta de la computadora
    bola = loadImage("Sprites/bola.png"); // Imagen de la pelota
  
    // Carga de los sonidos
    sonidoColision = loadSound('Sprites/bones.wav'); // Sonido para las colisiones con raquetas
    sonidoGol = loadSound('Sprites/gol.wav'); // Sonido para cuando hay gol
}

function setup() {
    createCanvas(anchoCanvas, altoCanvas);
    sonidoGol.setVolume(0.06); // Ajusta el volumen al 50%
    sonidoColision.setVolume(0.05); // Ajusta el volumen al 80%
    inicializarJuego();
    crearBotones();
}

function draw() {
    background(fondo); // Usa la imagen cargada como fondo

    // Dibuja marcos superior e inferior
    fill("#2B3FD9");
    rect(0, 0, anchoCanvas, 10); // Marco superior
    rect(0, altoCanvas - 10, anchoCanvas, 10); // Marco inferior

    if (!jugando) {
        mostrarPantallaInicial();
    } else {
        dibujarPuntuaciones();
        moverPelota();
        dibujarPelota();
        dibujarRaquetas();
        moverRaquetaJugador();
        moverRaquetaComputadora();
        verificarColisiones();
        verificarPuntos();
    }
}

// Función para inicializar el juego
function inicializarJuego() {
    pelotaX = width / 2;
    pelotaY = height / 2;

    // Ajustar velocidad según la dificultad
    if (dificultad === "facil") {
        velocidadX = 5;
        velocidadY = 5;
        velocidadcomputadora = 0.1;
    } else if (dificultad === "medio") {
        velocidadX = 10;
        velocidadY = 10;
        velocidadcomputadora = 0.2;
    } else if (dificultad === "dificil") {
        velocidadX = 15;
        velocidadY = 15;
        velocidadcomputadora = 0.3;
    }

    jugadorY = height / 2 - altoRaqueta / 2;
    computadoraX = width - 30;
    computadoraY = height / 2 - altoRaqueta / 2;
}

// Dibuja la pantalla inicial con botones
function mostrarPantallaInicial() {
    textSize(32);
    fill(255);
    textAlign(CENTER, CENTER);
    text("Bienvenido al Juego del Ping-Pong", width / 2, height / 3);
    textSize(20);
    text("Elige una dificultad para comenzar:", width / 2, height / 2);
}

// Crea botones de dificultad y salir
function crearBotones() {
    // Botón Fácil
    let botonFacil = createButton("Fácil");
    botonFacil.position(width / 2 - 100, height / 2 + 120);
    botonFacil.mousePressed(() => {
        dificultad = "facil";
        inicializarJuego();
        iniciarJuego();
    });

    // Botón Medio
    let botonMedio = createButton("Medio");
    botonMedio.position(width / 2 , height / 2 + 120);
    botonMedio.mousePressed(() => {
        dificultad = "medio";
        inicializarJuego();
        iniciarJuego();
    });

    // Botón Difícil
    let botonDificil = createButton("Difícil");
    botonDificil.position(width / 2 + 100, height / 2 + 120);
    botonDificil.mousePressed(() => {
        dificultad = "dificil";
        inicializarJuego();
        iniciarJuego();
    });

    // Botón Salir
    let botonSalir = createButton("Salir");
    botonSalir.position(width - 100, 20); // Posición inicial (fuera de juego)
    botonSalir.style("display", "none"); // Oculto inicialmente
    botonSalir.mousePressed(() => {
        jugando = false;
        puntosJugador = 0;
        puntosComputadora = 0;
        inicializarJuego();
        mostrarBotonesInicio();
    });

    // Guardar referencia de botones para manipularlos después
    window.botonesJuego = { botonFacil, botonMedio, botonDificil, botonSalir };
}

// Inicia el juego y oculta los botones de dificultad
function iniciarJuego() {
    jugando = true;
    ocultarBotonesInicio();
    window.botonesJuego.botonSalir.style("display", "block"); // Mostrar botón Salir
}

// Ocultar los botones de dificultad
function ocultarBotonesInicio() {
    Object.values(window.botonesJuego).forEach((boton) => {
        if (boton !== window.botonesJuego.botonSalir) {
            boton.style("display", "none");
        }
    });
}

// Mostrar los botones de dificultad
function mostrarBotonesInicio() {
    Object.values(window.botonesJuego).forEach((boton) => {
        if (boton !== window.botonesJuego.botonSalir) {
            boton.style("display", "block");
        } else {
            boton.style("display", "none");
        }
    });
}

// Dibuja la pelota con efecto de giro
function dibujarPelota() {
    push(); // Guarda el estado de la transformación actual
    translate(pelotaX, pelotaY); // Traslada el sistema de coordenadas a la posición de la pelota

    // Calcula la velocidad de giro en función de la velocidad de la pelota
    velocidadGiro = sqrt(velocidadX ** 2 + velocidadY ** 2) * 0.1; // Escalado para que sea proporcional
    anguloGiro += velocidadGiro; // Incrementa el ángulo de rotación

    rotate(anguloGiro); // Aplica la rotación
    image(bola, -diametro / 2, -diametro / 2, diametro, diametro); // Dibuja la pelota girada
    pop(); // Restaura el estado de la transformación
}

// Mueve la pelota
function moverPelota() {
    pelotaX += velocidadX;
    pelotaY += velocidadY;

    // Rebota en las paredes superior e inferior
    if (pelotaY - diametro / 2 < 10 || pelotaY + diametro / 2 > altoCanvas - 10) {
        velocidadY *= -1;
    }
}

// Dibuja las raquetas usando imágenes
function dibujarRaquetas() {
    image(barraJugador, jugadorX, jugadorY, anchoRaqueta, altoRaqueta);
    image(barraComputadora, computadoraX, computadoraY, anchoRaqueta, altoRaqueta);
}

// Mueve la raqueta del jugador con el mouse
function moverRaquetaJugador() {
    jugadorY = constrain(mouseY - altoRaqueta / 2, 10, altoCanvas - altoRaqueta - 10);
}

// Mueve la raqueta de la computadora
function moverRaquetaComputadora() {
    computadoraY += (pelotaY - computadoraY - altoRaqueta / 2) * velocidadcomputadora;
    computadoraY = constrain(computadoraY, 10, altoCanvas - altoRaqueta - 10);
}

// Verifica colisiones con las raquetas

function verificarColisiones() {
    // Incremento de velocidad en cada choque
    let incrementoVelocidad = 0.5;
  
    // Colisión con la raqueta del jugador
    if (
        pelotaX - diametro / 2 < jugadorX + anchoRaqueta &&
        pelotaY > jugadorY &&
        pelotaY < jugadorY + altoRaqueta
    ) {
        sonidoColision.play(); // Reproduce el sonido
        velocidadX *= -1; // Rebote en el eje X
        
        // Aumenta la velocidad tras el choque
        velocidadX += (velocidadX > 0 ? incrementoVelocidad : -incrementoVelocidad);
        velocidadY += (velocidadY > 0 ? incrementoVelocidad : -incrementoVelocidad);

        // Calcular el punto de colisión en la raqueta del jugador
        let interseccionY = (pelotaY - (jugadorY + altoRaqueta / 2)) / (altoRaqueta / 2); // Entre -1 y 1
        let angulo = map(interseccionY, -1, 1, -PI / 4, PI / 4); // Ángulo entre -45° y 45°

        // Asegurarse de que el ángulo no sea totalmente vertical
        if (abs(angulo) < PI / 8) { // Si el ángulo es menor que 22.5°, lo modificamos para no ser demasiado recto
            angulo = random(PI / 8, PI / 4) * (random() > 0.5 ? 1 : -1); // Asignamos un ángulo aleatorio entre 22.5° y 45°
        }

        // Ajustar la velocidad en Y con el nuevo ángulo
        velocidadY = sin(angulo) * abs(velocidadX);
        pelotaX = jugadorX + anchoRaqueta + diametro / 2;
    }

    // Colisión con la raqueta de la computadora
    if (
        pelotaX + diametro / 2 > computadoraX &&
        pelotaY > computadoraY &&
        pelotaY < computadoraY + altoRaqueta
    ) {
        sonidoColision.play(); // Reproduce el sonido
        velocidadX *= -1; // Rebote en el eje X
      
        // Aumenta la velocidad tras el choque
        velocidadX += (velocidadX > 0 ? incrementoVelocidad : -incrementoVelocidad);
        velocidadY += (velocidadY > 0 ? incrementoVelocidad : -incrementoVelocidad);

        // Calcular el punto de colisión en la raqueta de la computadora
        let interseccionY = (pelotaY - (computadoraY + altoRaqueta / 2)) / (altoRaqueta / 2); // Entre -1 y 1
        let angulo = map(interseccionY, -1, 1, -PI / 4, PI / 4); // Ángulo entre -45° y 45°

        // Asegurarse de que el ángulo no sea totalmente vertical
        if (abs(angulo) < PI / 8) { // Si el ángulo es menor que 22.5°, lo modificamos para no ser demasiado recto
            angulo = random(PI / 8, PI / 4) * (random() > 0.5 ? 1 : -1); // Asignamos un ángulo aleatorio entre 22.5° y 45°
        }

        // Ajustar la velocidad en Y con el nuevo ángulo
        velocidadY = sin(angulo) * abs(velocidadX);
        pelotaX = computadoraX - diametro / 2;
    }
}

// Verifica si alguien anotó un punto
function verificarPuntos() {
    if (pelotaX < jugadorX) {
        puntosComputadora++;
        sonidoGol.play(); // Reproduce el sonido de gol
        narrarMarcador(); // Narra el nuevo marcador
        inicializarJuego();
    } else if (pelotaX > computadoraX) {
        puntosJugador++;
        sonidoGol.play(); // Reproduce el sonido de gol
        narrarMarcador(); // Narra el nuevo marcador
        inicializarJuego();
    }
}

// Dibuja las puntuaciones
function dibujarPuntuaciones() {
    textSize(32);
    fill(255);
    textAlign(CENTER, TOP);
    text(`${puntosJugador} - ${puntosComputadora}`, width / 2, 10);
}

function narrarMarcador() {
  let narrador = window.speechSynthesis;
  let texto = `${puntosJugador} a ${puntosComputadora}`;
  let mensaje = new SpeechSynthesisUtterance(texto);

  // Configuración de la voz
  mensaje.lang = 'es-ES'; // Español
  mensaje.pitch = 1; // Tono
  mensaje.rate = 1; // Velocidad

  narrador.speak(mensaje);
}
