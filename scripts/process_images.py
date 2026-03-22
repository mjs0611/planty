import os
import glob
from rembg import remove

src_dir = "/Users/junseungmo/Documents/03_Resources/repos/planty/public/plants_raw"
dest_dir = "/Users/junseungmo/Documents/03_Resources/repos/planty/public/plants"

type_map = {
    "Cactus": "cactus",
    "Green": "green",
    "Pink": "flower"
}

os.makedirs(os.path.join(dest_dir, "cactus"), exist_ok=True)
os.makedirs(os.path.join(dest_dir, "green"), exist_ok=True)
os.makedirs(os.path.join(dest_dir, "flower"), exist_ok=True)

for file_path in glob.glob(os.path.join(src_dir, "*.PNG")):
    filename = os.path.basename(file_path)
    parts = filename.replace(".PNG", "").split("_")
    if len(parts) >= 3:
        plant_type_raw = parts[0]
        stage_num = parts[-1]
        
        if plant_type_raw in type_map:
            plant_type = type_map[plant_type_raw]
            out_filename = f"stage_{stage_num}.png"
            out_path = os.path.join(dest_dir, plant_type, out_filename)
            print(f"Processing {filename} -> {out_path}")
            
            with open(file_path, 'rb') as i:
                input_data = i.read()
                
            output_data = remove(input_data)
            
            with open(out_path, 'wb') as o:
                o.write(output_data)

print("Background removal completed for all images.")
