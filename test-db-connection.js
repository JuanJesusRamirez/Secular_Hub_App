require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('🔍 Probando conexión a PostgreSQL...\n');
    
    const count = await prisma.outlookCall.count();
    console.log(`✅ Conexión exitosa!`);
    console.log(`📊 Total de registros en OutlookCall: ${count}\n`);
    
    if (count > 0) {
      const sample = await prisma.outlookCall.findFirst();
      console.log('📝 Registro de ejemplo:');
      console.log(`   - Año: ${sample.year}`);
      console.log(`   - Institución: ${sample.institution}`);
      console.log(`   - Tema: ${sample.theme}\n`);
    } else {
      console.log('⚠️  La base de datos está vacía. Necesitas migrar los datos.');
    }
    
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    console.error('\nDetalles:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
