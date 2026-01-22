"""
Script para corregir caracteres con problemas de codificación en archivos JSON.

Este script corrige los caracteres que aparecen mal debido a problemas de 
doble codificación UTF-8 -> Windows-1252 -> UTF-8.

Ejemplos de correcciones:
  - AIâs → AI's (apóstrofe)
  - âlinchpinâ → "linchpin" (comillas)
  - companiesâwith → companies—with (em dash)

Uso:
    python fix_encoding.py                     # Procesa todos los JSON en expost/2025
    python fix_encoding.py archivo.json        # Procesa un archivo específico  
    python fix_encoding.py --dry-run           # Ver cambios sin aplicar
"""

import json
import os
import sys
import re

def fix_mangled_encoding(text):
    """
    Corrige secuencias UTF-8 que fueron incorrectamente interpretadas como Windows-1252.
    
    El problema ocurre cuando texto UTF-8 se lee como Windows-1252 y luego se guarda como UTF-8.
    Ejemplo: '—' (em dash) en UTF-8 es bytes E2 80 94
             Leído como Windows-1252: â (E2) + control chars (80 94)
    """
    if not isinstance(text, str):
        return text
    
    # Mapeo de secuencias corruptas a caracteres correctos
    # Formato: secuencia_corrupta -> carácter_correcto
    replacements = {
        # Em dash (—) - UTF-8: E2 80 94
        'â\x80\x94': '—',
        'â\x94': '—',  # Sin el byte 80
        
        # En dash (–) - UTF-8: E2 80 93
        'â\x80\x93': '–',
        'â\x93': '–',
        
        # Apóstrofe/comilla simple derecha (') - UTF-8: E2 80 99
        'â\x80\x99': "'",
        'â\x99': "'",
        
        # Comilla simple izquierda (') - UTF-8: E2 80 98
        'â\x80\x98': "'",
        'â\x98': "'",
        
        # Comilla doble izquierda (") - UTF-8: E2 80 9C
        'â\x80\x9c': '"',
        'â\x9c': '"',
        
        # Comilla doble derecha (") - UTF-8: E2 80 9D
        'â\x80\x9d': '"',
        'â\x9d': '"',
        
        # Elipsis (…) - UTF-8: E2 80 A6
        'â\x80\xa6': '…',
        'â\xa6': '…',
        
        # Bullet (•) - UTF-8: E2 80 A2
        'â\x80\xa2': '•',
        'â\xa2': '•',
        
        # Espacio no separable - Â seguido de espacio
        'Â ': ' ',
        'Â': '',
        
        # Casos adicionales: â standalone (común en "Europeâs" -> "Europe's")
        'âs ': "'s ",
        'ât ': "'t ",
        'âre ': "'re ",
        'âll ': "'ll ",
        'âve ': "'ve ",
        'âd ': "'d ",
        ' â ': ' — ',  # â rodeado de espacios = em dash
        
        # Limpiar caracteres de control huérfanos
        '\x80': '',
        '\x93': '',
        '\x94': '',
        '\x98': '',
        '\x99': '',
        '\x9c': '',
        '\x9d': '',
    }
    
    for mangled, fixed in replacements.items():
        text = text.replace(mangled, fixed)
    
    return text


def walk_and_fix(obj):
    """Recorre recursivamente un objeto JSON y corrige todos los strings."""
    if isinstance(obj, dict):
        return {walk_and_fix(k): walk_and_fix(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [walk_and_fix(i) for i in obj]
    elif isinstance(obj, str):
        return fix_mangled_encoding(obj)
    else:
        return obj


def process_json_file(file_path, dry_run=False):
    """
    Procesa un archivo JSON y corrige los caracteres.
    
    Args:
        file_path: Ruta al archivo
        dry_run: Si es True, solo muestra los cambios sin aplicarlos
        
    Returns:
        Número de cambios realizados
    """
    print(f"\n{'='*60}")
    print(f"Procesando: {file_path}")
    print(f"{'='*60}")
    
    # Leer contenido original
    with open(file_path, 'r', encoding='utf-8') as f:
        original_content = f.read()
    
    # Cargar JSON
    try:
        data = json.loads(original_content)
    except json.JSONDecodeError as e:
        print(f"  ✗ Error: JSON inválido - {e}")
        return 0
    
    # Aplicar correcciones
    fixed_data = walk_and_fix(data)
    
    # Generar nuevo contenido
    fixed_content = json.dumps(fixed_data, indent=2, ensure_ascii=False)
    
    # Comparar y mostrar diferencias
    if original_content.strip() == fixed_content.strip():
        print("  ○ Sin cambios necesarios")
        return 0
    
    # Encontrar ejemplos de cambios para mostrar
    changes_found = []
    
    # Buscar patrones específicos que cambiaron
    patterns_to_check = [
        (r'â\x80\x99', "'", "apóstrofe"),
        (r'â\x99', "'", "apóstrofe"),
        (r'â\x80\x9c', '"', "comilla izq"),
        (r'â\x9c', '"', "comilla izq"),
        (r'â\x80\x9d', '"', "comilla der"),
        (r'â\x9d', '"', "comilla der"),
        (r'â\x80\x94', '—', "em dash"),
        (r'â\x94', '—', "em dash"),
    ]
    
    for pattern, replacement, desc in patterns_to_check:
        matches = re.findall(f'.{{0,15}}{re.escape(pattern)}.{{0,15}}', original_content)
        for match in matches[:3]:  # Mostrar máximo 3 ejemplos por tipo
            clean_match = match.replace('\n', ' ').replace('\r', '')
            changes_found.append(f"  • {desc}: ...{clean_match}...")
    
    # Contar cambios aproximados
    change_count = sum(1 for a, b in zip(original_content, fixed_content) if a != b)
    
    print(f"  Cambios encontrados: ~{change_count} caracteres")
    
    if changes_found:
        print("\n  Ejemplos de correcciones:")
        for change in changes_found[:10]:
            print(change)
    
    if dry_run:
        print("\n  [DRY-RUN] No se guardaron cambios")
        return change_count
    
    # Crear backup
    backup_path = file_path + '.bak'
    with open(backup_path, 'w', encoding='utf-8') as f:
        f.write(original_content)
    print(f"\n  ✓ Backup creado: {backup_path}")
    
    # Guardar archivo corregido
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(fixed_content)
    print(f"  ✓ Archivo corregido guardado")
    
    return change_count


def main():
    # Verificar argumentos
    dry_run = '--dry-run' in sys.argv
    args = [a for a in sys.argv[1:] if a != '--dry-run']
    
    # Determinar archivos a procesar
    if args:
        # Archivos específicos pasados como argumentos
        files_to_process = args
    else:
        # Por defecto, procesar todos los JSON en expost/2025
        target_dir = r'c:\Users\juanj\OneDrive\Desktop\AI_Sandbox\Secular_Hub_App\lib\data\expost\2025'
        if os.path.exists(target_dir):
            files_to_process = [
                os.path.join(target_dir, f) 
                for f in os.listdir(target_dir) 
                if f.endswith('.json')
            ]
        else:
            print(f"Directorio no encontrado: {target_dir}")
            return
    
    if dry_run:
        print("\n🔍 MODO DRY-RUN: Solo se muestran los cambios, no se aplican.\n")
    else:
        print("\n🔧 Procesando archivos...\n")
    
    # Procesar archivos
    total_changes = 0
    for file_path in files_to_process:
        if os.path.exists(file_path):
            changes = process_json_file(file_path, dry_run)
            total_changes += changes
        else:
            print(f"  ✗ Archivo no encontrado: {file_path}")
    
    # Resumen
    print(f"\n{'='*60}")
    print("RESUMEN")
    print(f"{'='*60}")
    print(f"Archivos procesados: {len(files_to_process)}")
    print(f"Total de cambios: ~{total_changes} caracteres")
    
    if dry_run and total_changes > 0:
        print("\n💡 Para aplicar los cambios, ejecuta sin --dry-run:")
        print("   python scripts/fix_encoding.py")


if __name__ == "__main__":
    main()
