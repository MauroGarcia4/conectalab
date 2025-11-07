#!/usr/bin/env node

/**
 * Script de Build para Optimización
 * 
 * Este script optimiza los archivos para producción:
 * - Minifica CSS y JS
 * - Optimiza imágenes (requiere herramientas externas)
 * - Genera bundle optimizado
 * 
 * Uso: node build.js
 */

const fs = require('fs');
const path = require('path');

// Configuración
const config = {
    sourceDir: './',
    buildDir: './dist',
    minify: true,
    optimizeImages: false // Requiere herramientas como sharp o imagemin
};

// Función para minificar CSS básico (remover comentarios y espacios)
function minifyCSS(css) {
    return css
        .replace(/\/\*[\s\S]*?\*\//g, '') // Remover comentarios
        .replace(/\s+/g, ' ') // Remover espacios múltiples
        .replace(/;\s*}/g, '}') // Remover punto y coma antes de }
        .replace(/\s*{\s*/g, '{') // Remover espacios alrededor de {
        .replace(/\s*}\s*/g, '}') // Remover espacios alrededor de }
        .replace(/\s*:\s*/g, ':') // Remover espacios alrededor de :
        .replace(/\s*;\s*/g, ';') // Remover espacios alrededor de ;
        .replace(/\s*,\s*/g, ',') // Remover espacios alrededor de ,
        .trim();
}

// Función para minificar JS básico (remover comentarios y espacios)
function minifyJS(js) {
    return js
        .replace(/\/\*[\s\S]*?\*\//g, '') // Remover comentarios multilínea
        .replace(/\/\/.*$/gm, '') // Remover comentarios de línea
        .replace(/\s+/g, ' ') // Remover espacios múltiples
        .replace(/\s*{\s*/g, '{') // Remover espacios alrededor de {
        .replace(/\s*}\s*/g, '}') // Remover espacios alrededor de }
        .replace(/\s*;\s*/g, ';') // Remover espacios alrededor de ;
        .replace(/\s*,\s*/g, ',') // Remover espacios alrededor de ,
        .trim();
}

// Función para crear directorio si no existe
function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

// Función principal de build
function build() {
    console.log('🚀 Iniciando build de optimización...\n');

    // Crear directorio de build
    ensureDir(config.buildDir);

    // Copiar archivos HTML (sin minificar por ahora)
    console.log('📄 Copiando archivos HTML...');
    const htmlFiles = ['index.html'];
    htmlFiles.forEach(file => {
        const source = path.join(config.sourceDir, file);
        const dest = path.join(config.buildDir, file);
        if (fs.existsSync(source)) {
            fs.copyFileSync(source, dest);
            console.log(`   ✓ ${file}`);
        }
    });

    // Minificar CSS
    if (config.minify) {
        console.log('\n🎨 Minificando CSS...');
        const cssFile = path.join(config.sourceDir, 'css', 'styles.css');
        if (fs.existsSync(cssFile)) {
            const css = fs.readFileSync(cssFile, 'utf8');
            const minified = minifyCSS(css);
            ensureDir(path.join(config.buildDir, 'css'));
            fs.writeFileSync(
                path.join(config.buildDir, 'css', 'styles.min.css'),
                minified
            );
            console.log('   ✓ styles.css → styles.min.css');
        }
    }

    // Minificar JS
    if (config.minify) {
        console.log('\n📦 Minificando JavaScript...');
        const jsFiles = [
            'js/main.js',
            'js/supabase-config.js',
            'js/utils/error-tracker.js',
            'js/utils/image-optimizer.js'
        ];

        ensureDir(path.join(config.buildDir, 'js'));
        ensureDir(path.join(config.buildDir, 'js', 'utils'));

        jsFiles.forEach(file => {
            const source = path.join(config.sourceDir, file);
            if (fs.existsSync(source)) {
                const js = fs.readFileSync(source, 'utf8');
                const minified = minifyJS(js);
                const dest = path.join(config.buildDir, file.replace('.js', '.min.js'));
                ensureDir(path.dirname(dest));
                fs.writeFileSync(dest, minified);
                console.log(`   ✓ ${file} → ${file.replace('.js', '.min.js')}`);
            }
        });
    }

    // Copiar imágenes (sin optimizar por ahora)
    console.log('\n🖼️  Copiando imágenes...');
    const imgDir = path.join(config.sourceDir, 'img');
    if (fs.existsSync(imgDir)) {
        ensureDir(path.join(config.buildDir, 'img'));
        const images = fs.readdirSync(imgDir);
        images.forEach(img => {
            fs.copyFileSync(
                path.join(imgDir, img),
                path.join(config.buildDir, 'img', img)
            );
        });
        console.log(`   ✓ ${images.length} imágenes copiadas`);
    }

    // Generar reporte
    console.log('\n✅ Build completado!');
    console.log(`📁 Archivos en: ${config.buildDir}`);
    console.log('\n💡 Nota: Para producción, considera usar:');
    console.log('   - Terser para minificación JS avanzada');
    console.log('   - cssnano para minificación CSS avanzada');
    console.log('   - imagemin para optimización de imágenes');
    console.log('   - webpack o rollup para bundling');
}

// Ejecutar build
try {
    build();
} catch (error) {
    console.error('❌ Error durante el build:', error);
    process.exit(1);
}

