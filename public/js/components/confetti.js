const colors = ['#7b5cf0', '#6342d8', '#ff4081', '#00e5ff', '#ffd740'];

function setupCanvas(id) {
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '9999';
    canvas.id = id;
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resize);
    resize();

    return { canvas, ctx };
}

function Confetti() {
    const { canvas, ctx } = setupCanvas('canvas-wrapping');
    const timeDelta = 0.15;
    const xAmplitude = 0.5;
    const yAmplitude = 1;
    const xVelocity = 2;
    if (window.innerWidth < 600) {
        var yVelocity = 2.5;
    } else {
        var yVelocity = 3;
    }

    let time = 0;
    const confetti = [];

    for (let i = 0; i < 100; i++) {
        const radius = Math.random() * 5 + 2.25;
        const tilt = Math.floor(Math.random() * 10) - 5;
        const xSpeed = Math.random() * xVelocity - xVelocity / 2;
        const ySpeed = Math.random() * yVelocity;
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height - canvas.height;

        confetti.push({
            x,
            y,
            xSpeed,
            ySpeed,
            radius,
            tilt,
            color: colors[Math.floor(Math.random() * colors.length)],
            phaseOffset: i,
        });
    }

    let animationId;

    function update() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        confetti.forEach((piece) => {
            piece.y += (Math.cos(piece.phaseOffset + time) + 1) * yAmplitude + piece.ySpeed;
            piece.x += Math.sin(piece.phaseOffset + time) * xAmplitude + piece.xSpeed;

            if (piece.x < 0) piece.x = canvas.width;
            if (piece.x > canvas.width) piece.x = 0;
            if (piece.y > canvas.height) piece.y = 0;

            ctx.beginPath();
            ctx.lineWidth = piece.radius;
            ctx.strokeStyle = piece.color;
            ctx.moveTo(piece.x + piece.tilt, piece.y);
            ctx.lineTo(piece.x + piece.tilt / 2, piece.y + piece.tilt + piece.radius);
            ctx.stroke();
        });

        time += timeDelta;
        animationId = requestAnimationFrame(update);
    }

    update();
}