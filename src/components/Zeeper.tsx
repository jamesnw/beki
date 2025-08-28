import { createEffect, createMemo, onMount } from "solid-js";
import { ZeepDetails } from "../data/nfc";
const canvasSize = 1000;
const canvasWidth = canvasSize;
const canvasHeight = canvasSize;

export default function Zeeper({
  measured,
}: {
  measured: () => Record<string, number>;
}) {
  let canvasRef: HTMLCanvasElement | undefined;

  const drawVertAxis = (ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = "orange";
    ctx.lineWidth = 1;
    ctx.moveTo(0, 0);
    ctx.lineTo(1000, 0);
    ctx.moveTo(0, 200);
    ctx.lineTo(1000, 200);
    ctx.moveTo(0, 400);
    ctx.lineTo(1000, 400);
    ctx.moveTo(0, 600);
    ctx.lineTo(1000, 600);
    ctx.moveTo(0, 800);
    ctx.lineTo(1000, 800);
    ctx.moveTo(0, 1000);
    ctx.lineTo(1000, 1000);
    ctx.stroke();
  };

  const drawBox = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
  ) => {
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);
  };

  const drawSpeciesBox = (
    ctx: CanvasRenderingContext2D,
    duration: number,
    freqLow: number,
    freqHigh: number,
  ) => {
    drawBox(
      ctx,
      canvasWidth / 2 - (duration * 10 /2) ,
      canvasHeight - freqHigh * 100,
      duration * 10,
      (freqHigh - freqLow) * 100,
    );
  }

  const ctx = createMemo(() => {
    if (!canvasRef) return;
    return canvasRef.getContext("2d");
  }, [canvasRef]);

  createEffect(() => {
    console.log('drawing zeep', measured());
     if (!canvasRef) return;
    let ctx =  canvasRef.getContext("2d");

    if (!ctx) return;
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, 1000, 1000);
    drawVertAxis(ctx);
    const m = measured();
    // duration 0-100ms maps to 0-1000px
    // frequency 5-10k maps to 0-1000px
    ctx.strokeStyle = "red";
    drawSpeciesBox(
      ctx,
      m.duration,
      m.frequency_low,
      m.frequency_high,
    );
    ctx.strokeStyle = "blue";
    Object.entries(ZeepDetails).forEach(([bird, details]) => {
      drawSpeciesBox(
        ctx,
        details["Average Duration"],
        details["Frequency Low Average"],
        details["Frequency High Average"],
      );
    });
  }, [measured]);

  onMount(() => {
    let ct = ctx();
    if (!ct) return;
    drawVertAxis(ct);
  });
  return (
    <canvas
    style="height: 500px; width: 500px;"
      ref={canvasRef}
      id="zeeper"
      width={canvasWidth}
      height={canvasHeight}
    ></canvas>
  );
}
