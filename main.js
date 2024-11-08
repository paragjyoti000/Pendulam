import "./style.css";

const canvas = document.querySelector("#canvas"),
    ctx = canvas.getContext("2d");

let soundEnabled = false;

document.onvisibilitychange = () => (soundEnabled = false);

canvas.onclick = () => (soundEnabled = !soundEnabled);

let startTime = new Date().getTime();

const calcNextImpactTime = (currentImpactTime, velocity) => {
    return currentImpactTime + (Math.PI / velocity) * 1000;
};

const oneFullLoop = Math.PI * 2,
    maxLoops = 50,
    duration = 600;

const arcs = [
    "#405de6",
    "#5851db",
    "#833ab4",
    "#c13584",
    "#e1306c",
    "#fd1d1d",
    "#FFC0CB",
    "#F0B1BC",
    "#33ccff",
    "#ff99cc",
    "#ffcc99",
    "#99ccff",
    "#cc99ff",
    "#99ffcc",
    "#ccff99",
    "#ffccff",
    "#ccffff",
    "#ffffcc",
    "#cccccc",
    "#ffffff",
    "#ff00ff",
].map((color, index) => {
    const audio = new Audio(`/notes/key-${index}.ogg`);

    audio.volume = 0.2;

    const numberOfLoops = oneFullLoop * (maxLoops - index),
        velocity = numberOfLoops / duration;

    return {
        color,
        audio,
        nextImpactTime: calcNextImpactTime(startTime, velocity),
        velocity,
    };
});

const draw = () => {
    const currentTime = new Date().getTime(),
        timePassed = (currentTime - startTime) / 1000;

    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    const start = {
        x: canvas.width * 0.1,
        y: canvas.height * 0.9,
    };

    const end = {
        x: canvas.width * 0.9,
        y: canvas.height * 0.9,
    };

    ctx.strokeStyle = "white";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";

    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();

    const center = {
        x: canvas.width * 0.5,
        y: canvas.height * 0.9,
    };

    const lineLength = end.x - start.x,
        minRadius = lineLength * 0.05;

    const spacing = (lineLength / 2 - minRadius) / (arcs.length - 1);

    arcs.forEach((arc, index) => {
        const arcRadius = minRadius + spacing * index;

        ctx.beginPath();
        ctx.strokeStyle = arc.color;
        ctx.arc(center.x, center.y, arcRadius, Math.PI, Math.PI * 2);
        ctx.stroke();

        const velocity = arc.velocity,
            maxAngle = Math.PI * 2,
            distance = Math.PI + timePassed * velocity,
            modDistance = distance % maxAngle,
            adjustDistance =
                modDistance >= Math.PI ? modDistance : maxAngle - modDistance;

        const X = center.x + arcRadius * Math.cos(adjustDistance),
            Y = center.y + arcRadius * Math.sin(adjustDistance);

        ctx.beginPath();
        ctx.fillStyle = "white";
        ctx.arc(X, Y, lineLength * 0.009, 0, Math.PI * 2);
        ctx.fill();

        if (currentTime >= arc.nextImpactTime) {
            if (soundEnabled) arc.audio.play();

            arc.nextImpactTime = calcNextImpactTime(
                arc.nextImpactTime,
                arc.velocity
            );
        }
    });

    requestAnimationFrame(draw);
};

draw();
