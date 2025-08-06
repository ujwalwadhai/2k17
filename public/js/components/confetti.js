function Confetti({
    canvasId = 'canvas-wrapping',
    spawnRate = 5,
    duration = 3000,
    gravity = 0.9,
    xAmplitude = 0.75,
    yAmplitude = 1,
    xVelocity = 2,
    yVelocity = window.innerWidth < 600 ? 1 : 3,
    origin = { x: 0.5, y: 0 },
    colors = ['#7b5cf0', '#6342d8', '#ff4081', '#00e5ff', '#ffd740'],
    radiusRange = [2.25, 7.25],
    pointerEvents = 'none',
    zIndex = 9999,
    maxPieces = 200
} = {}) {
    function setupCanvas(id) {
        const canvas = document.createElement('canvas');
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100vw';
        canvas.style.height = '100vh';
        canvas.style.pointerEvents = pointerEvents;
        canvas.style.zIndex = zIndex;
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

    const { canvas, ctx } = setupCanvas(canvasId);
    const timeDelta = 0.15;
    let time = 0;
    let animationId;
    let spawning = true;
    const confetti = [];

    function createConfettiPiece() {
        const radius = Math.random() * (radiusRange[1] - radiusRange[0]) + radiusRange[0];
        const tilt = Math.floor(Math.random() * 10) - 5;
        const xSpeed = Math.random() * xVelocity - xVelocity / 2;
        const ySpeed = Math.random() * yVelocity;
        const x = origin.x * canvas.width + (Math.random() - 0.5) * canvas.width * 0.5;
        const y = origin.y * canvas.height;

        return {
            x,
            y,
            xSpeed,
            ySpeed,
            radius,
            tilt,
            color: colors[Math.floor(Math.random() * colors.length)],
            phaseOffset: Math.random() * 100,
        };
    }

    function update() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (spawning && confetti.length < maxPieces) {
            for (let i = 0; i < spawnRate; i++) {
                confetti.push(createConfettiPiece());
            }
        }

        confetti.forEach((piece) => {
            piece.y += (Math.cos(piece.phaseOffset + time) + 1) * yAmplitude * gravity + piece.ySpeed;
            piece.x += Math.sin(piece.phaseOffset + time) * xAmplitude + piece.xSpeed;

            ctx.beginPath();
            ctx.lineWidth = piece.radius;
            ctx.strokeStyle = piece.color;
            ctx.moveTo(piece.x + piece.tilt, piece.y);
            ctx.lineTo(piece.x + piece.tilt / 2, piece.y + piece.tilt + piece.radius);
            ctx.stroke();
        });

        for (let i = confetti.length - 1; i >= 0; i--) {
            if (confetti[i].y > canvas.height + 20) {
                confetti.splice(i, 1);
            }
        }

        time += timeDelta;

        if (!spawning && confetti.length === 0) {
            cancelAnimationFrame(animationId);
            if (canvas && canvas.parentNode) {
                canvas.parentNode.removeChild(canvas);
            }
            return;
        }

        animationId = requestAnimationFrame(update);
    }

    update();

    if (typeof duration === 'number') {
        setTimeout(() => {
            spawning = false;
        }, duration);
    }
}
