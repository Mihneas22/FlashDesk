from fastapi import FastAPI, UploadFile, File, HTTPException
from pix2tex.cli import LatexOCR
from PIL import Image
import io

app = FastAPI(title="LaTeX OCR Service")

try:
    model = LatexOCR()
except Exception as e:
    print(f"Error loading model: {e}")

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File provided is not an image.")

    try:
        img_bytes = await file.read()
        image = Image.open(io.BytesIO(img_bytes))
        
        latex_string = model(image)
        
        return {"latex": latex_string}
    
    except Exception as e:
        return {"error": str(e), "latex": ""}

@app.get("/health")
async def health():
    return {"status": "ready"}