#!/usr/bin/env node
/**
 * Test automatisé: upload PDF → watermark → download
 * Vérifie que canvasesToPdf() fonctionne avec le fix image.width/image.height
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

(async () => {
  // Créer un PDF de test simple
  const testPdfPath = '/tmp/test_watermark_input.pdf';
  
  // Utiliser pdf-lib pour créer un PDF de test
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  for (let i = 0; i < 2; i++) {
    const page = pdfDoc.addPage([612, 792]);
    page.drawText(`Page ${i + 1} - Test Document`, {
      x: 72,
      y: 720,
      size: 24,
      font,
      color: rgb(0, 0, 0),
    });
    page.drawText('Lorem ipsum dolor sit amet, consectetur adipiscing elit.', {
      x: 72,
      y: 680,
      size: 12,
      font,
      color: rgb(0.3, 0.3, 0.3),
    });
  }
  
  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(testPdfPath, pdfBytes);
  console.log(`✅ PDF de test créé: ${testPdfPath} (${pdfBytes.length} bytes)`);
  
  // Lancer Chromium headless
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage']
  });
  
  const context = await browser.newContext({ acceptDownloads: true });
  const page = await context.newPage();
  
  // Capturer les erreurs console
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(`[console.error] ${msg.text()}`);
  });
  page.on('pageerror', err => consoleErrors.push(`[pageerror] ${err.message}`));
  
  // Naviguer vers l'app
  console.log('Navigate to http://localhost:5173...');
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  console.log(`Title: ${await page.title()}`);
  
  // Attendre que l'app soit prête
  await page.waitForSelector('#watermark-text', { timeout: 10000 });
  console.log('✅ App loaded');
  
  // Définir le texte du watermark
  await page.fill('#watermark-text', 'CONFIDENTIEL');
  console.log('✅ Watermark text set');
  
  // Upload le PDF
  const fileInput = await page.$('input[type="file"]');
  if (!fileInput) {
    console.error('❌ File input not found!');
    console.log('Available inputs:', await page.$$eval('input', els => els.map(e => ({id: e.id, type: e.type, accept: e.accept}))));
    await browser.close();
    process.exit(1);
  }
  
  await fileInput.setInputFiles(testPdfPath);
  console.log('✅ PDF uploaded, waiting for preview...');
  
  // Attendre que les canvases apparaissent
  await page.waitForTimeout(3000);
  const canvasCount = await page.$$eval('.preview-area canvas, .workspace__preview-area canvas, canvas', els => els.length);
  console.log(`Canvas count in preview: ${canvasCount}`);
  
  // Cliquer sur download et capturer le fichier
  const downloadBtn = await page.$('#btn-download');
  if (!downloadBtn) {
    // Chercher d'autres boutons
    const buttons = await page.$$eval('button', els => els.map(e => ({id: e.id, text: e.textContent.trim()})));
    console.log('Buttons:', JSON.stringify(buttons));
    await browser.close();
    process.exit(1);
  }
  
  console.log('Clicking download...');
  
  try {
    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 15000 }),
      downloadBtn.click()
    ]);
    
    const suggestedFilename = download.suggestedFilename();
    console.log(`✅ Download started: ${suggestedFilename}`);
    
    const savePath = '/tmp/test_watermark_output.pdf';
    await download.saveAs(savePath);
    
    const stats = fs.statSync(savePath);
    console.log(`✅ File saved: ${savePath} (${stats.size} bytes)`);
    
    // Vérifier que c'est un vrai PDF
    const header = fs.readFileSync(savePath, { encoding: 'utf8', flag: 'r' }).substring(0, 5);
    console.log(`Header: ${header}`);
    
    if (header === '%PDF-') {
      console.log('✅✅✅ PDF TÉLÉCHARGÉ AVEC SUCCÈS — le fix fonctionne!');
    } else {
      console.log('❌ Le fichier n\'est pas un PDF valide');
    }
  } catch (err) {
    console.log(`❌ Download failed: ${err.message}`);
  }
  
  if (consoleErrors.length > 0) {
    console.log(`\nConsole errors (${consoleErrors.length}):`);
    consoleErrors.forEach(e => console.log(`  ${e}`));
  } else {
    console.log('\n✅ Aucune erreur console');
  }
  
  await browser.close();
  console.log('Done.');
})().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
