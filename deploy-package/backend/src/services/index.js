import puppeteer from 'puppeteer';
import Handlebars from 'handlebars';
import { config } from '../config/index.js';

/**
 * PDF Service - Generates professional PDF reports
 */
export class PDFService {
  /**
   * Generate a claim PDF report
   */
  static async generateClaimPDF(claim, garage) {
    try {
      // Generate HTML content
      const html = this.generateClaimHTML(claim, garage);
      
      // If external service is configured, use it
      if (config.pdf.useExternalService && config.pdf.externalApiKey) {
        return await this.generateWithExternalService(html, claim.reference);
      }
      
      // Otherwise use Puppeteer
      return await this.generateWithPuppeteer(html, claim.reference);
    } catch (error) {
      console.error('PDF Generation error:', error);
      throw new Error(`PDF generation failed: ${error.message}`);
    }
  }

  /**
   * Generate HTML for claim report
   */
  static generateClaimHTML(claim, garage) {
    const reference = claim.reference || `VWC-${new Date().getFullYear()}-${Math.floor(Math.random() * 999999).toString().padStart(6, '0')}`;
    const vehicleData = claim.vehicle_data || {};
    const clientData = claim.client_data || {};
    const insuranceData = claim.insurance_details || {};
    const aiReport = claim.ai_report || {};
    const damages = aiReport.damages || [];
    const photos = claim.images || [];
    const manualAdjustments = claim.manual_adjustments || {};
    const adjustedDamages = manualAdjustments.adjusted_damages || [];

    const totalHours = damages.reduce((sum, d) => sum + (d.estimated_hours || 0), 0);

    const garageDisplay = {
      name: garage?.company_name || garage?.name || 'Garage',
      address: garage?.company_address ? 
        [garage.company_address.street, garage.company_address.zip, garage.company_address.city].filter(Boolean).join(', ') : '',
      phone: garage?.company_phone || '',
      email: garage?.company_email || '',
    };

    const escapeHtml = (text) => {
      if (!text) return '';
      return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    };

    return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Rapport ${escapeHtml(reference)}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    @page { margin: 15mm; }
    body {
      font-family: 'Arial', 'Helvetica', sans-serif;
      color: #1a1a1a;
      line-height: 1.4;
      font-size: 10pt;
      background: white;
    }
    
    .modern-header {
      border: 2px solid #3d5a80;
      margin-bottom: 20px;
    }
    .header-top {
      background: #3d5a80;
      color: white;
      padding: 25px 30px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .header-logo {
      width: 90px;
      height: auto;
      background: white;
      padding: 8px;
      border-radius: 4px;
    }
    .header-title {
      text-align: center;
      flex: 1;
      margin: 0 20px;
    }
    .header-title h1 {
      font-size: 20pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 4px;
    }
    .header-title .subtitle {
      font-size: 9pt;
      opacity: 0.85;
      font-weight: 400;
    }
    .ref-badge {
      background: white;
      color: #e63946;
      padding: 10px 20px;
      border-radius: 4px;
      text-align: center;
    }
    .ref-badge .label {
      font-size: 7pt;
      text-transform: uppercase;
      font-weight: 700;
      color: #666;
      margin-bottom: 3px;
    }
    .ref-badge .number {
      font-size: 14pt;
      font-weight: 800;
      font-family: monospace;
      color: #e63946;
    }
    .header-info {
      padding: 15px 30px;
      background: #f8f9fa;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid #dee2e6;
    }
    .company-info {
      font-size: 9pt;
      color: #495057;
    }
    .company-info strong {
      color: #212529;
      font-size: 11pt;
      display: block;
      margin-bottom: 3px;
    }
    .date-info {
      text-align: right;
      font-size: 8pt;
      color: #6c757d;
    }
    .date-info strong {
      display: block;
      font-size: 10pt;
      color: #212529;
      margin-top: 2px;
    }

    .section {
      margin-bottom: 25px;
      page-break-inside: avoid;
    }
    .section-header {
      background: #3d5a80;
      color: white;
      padding: 10px 20px;
      margin-bottom: 15px;
      display: flex;
      align-items: center;
      border-left: 5px solid #e63946;
    }
    .section-number {
      font-size: 18pt;
      font-weight: 800;
      margin-right: 12px;
      opacity: 0.9;
    }
    .section-title {
      font-size: 11pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      border: 1px solid #dee2e6;
      padding: 15px;
      background: #f8f9fa;
    }
    .info-field {
      background: white;
      padding: 10px 12px;
      border-left: 3px solid #5b9bd5;
    }
    .info-field.full {
      grid-column: 1 / -1;
    }
    .field-label {
      font-size: 7pt;
      color: #5b9bd5;
      text-transform: uppercase;
      font-weight: 700;
      margin-bottom: 4px;
      letter-spacing: 0.3px;
    }
    .field-value {
      font-size: 10pt;
      color: #212529;
      font-weight: 600;
    }

    .modern-table {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid #dee2e6;
      margin-top: 10px;
    }
    .modern-table thead {
      background: #3d5a80;
      color: white;
    }
    .modern-table th {
      padding: 10px;
      text-align: left;
      font-size: 8pt;
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 0.3px;
    }
    .modern-table td {
      padding: 10px;
      border-bottom: 1px solid #dee2e6;
      font-size: 9pt;
    }
    .modern-table tbody tr:nth-child(even) {
      background: #f8f9fa;
    }
    
    .status-badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 3px;
      font-size: 8pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.2px;
    }
    .status-defavorable { 
      background: #e63946; 
      color: white;
    }
    .status-reserve { 
      background: #f77f00; 
      color: white;
    }
    .status-favorable { 
      background: #06d6a0; 
      color: white;
    }

    .ai-box {
      background: white;
      border: 2px solid #5b9bd5;
      border-radius: 6px;
      padding: 20px;
      margin-top: 15px;
    }
    .ai-box-header {
      display: flex;
      align-items: center;
      margin-bottom: 12px;
      padding-bottom: 10px;
      border-bottom: 2px solid #5b9bd5;
    }
    .ai-icon {
      background: #5b9bd5;
      color: white;
      width: 35px;
      height: 35px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 14pt;
      margin-right: 12px;
    }
    .ai-box-title {
      font-size: 10pt;
      font-weight: 700;
      color: #3d5a80;
      text-transform: uppercase;
    }
    .ai-content {
      font-size: 9pt;
      line-height: 1.6;
      color: #495057;
    }
    .ai-meta {
      margin-top: 12px;
      padding-top: 10px;
      border-top: 1px solid #dee2e6;
      font-size: 7pt;
      color: #6c757d;
      font-style: italic;
    }

    .expert-box {
      background: #fff8e1;
      border: 2px solid #ffc107;
      border-radius: 6px;
      padding: 20px;
    }
    .expert-box-header {
      display: flex;
      align-items: center;
      margin-bottom: 12px;
      padding-bottom: 10px;
      border-bottom: 2px solid #ffc107;
    }
    .expert-icon {
      background: #ffc107;
      color: #000;
      width: 35px;
      height: 35px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 14pt;
      margin-right: 12px;
    }
    .expert-box-title {
      font-size: 10pt;
      font-weight: 700;
      color: #856404;
      text-transform: uppercase;
    }

    .total-row {
      background: #3d5a80 !important;
      color: white !important;
      font-weight: 700;
    }
    .total-row td {
      font-size: 11pt !important;
      padding: 12px !important;
    }
    .total-yellow {
      background: #ffc107 !important;
      color: #000 !important;
      font-weight: 700;
    }

    .photos-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      margin-top: 15px;
      page-break-inside: avoid;
    }
    .photo-item {
      background: white;
      border: 1px solid #dee2e6;
      padding: 8px;
    }
    .photo-item img {
      width: 100%;
      height: 160px;
      object-fit: cover;
      border: 1px solid #dee2e6;
    }
    .photo-label {
      font-size: 8pt;
      color: #6c757d;
      text-align: center;
      margin-top: 6px;
      font-weight: 600;
    }

    .footer-signatures {
      margin-top: 40px;
      border: 2px solid #3d5a80;
      page-break-inside: avoid;
    }
    .signatures-row {
      display: flex;
      justify-content: space-between;
      padding: 30px 20px;
      border-bottom: 1px solid #dee2e6;
    }
    .signature-box {
      text-align: center;
      flex: 1;
    }
    .signature-box .label {
      font-size: 8pt;
      color: #6c757d;
      text-transform: uppercase;
      margin-bottom: 40px;
      font-weight: 700;
    }
    .signature-box .line {
      border-top: 2px solid #3d5a80;
      padding-top: 8px;
      font-size: 9pt;
      font-weight: 600;
      color: #212529;
    }
    .footer-company {
      background: #3d5a80;
      color: white;
      padding: 15px;
      text-align: center;
    }
    .footer-company .name {
      font-size: 11pt;
      font-weight: 700;
      margin-bottom: 5px;
    }
    .footer-company .info {
      font-size: 7pt;
      opacity: 0.85;
      line-height: 1.5;
    }
  </style>
</head>
<body>
  <div class="modern-header">
    <div class="header-top">
      ${garage?.logo_url ? `<img src="${garage.logo_url}" class="header-logo" alt="Logo">` : '<div style="width:90px;"></div>'}
      <div class="header-title">
        <h1>RAPPORT D'EXPERTISE AUTOMOBILE</h1>
        <div class="subtitle">Diagnostic complet de carrosserie</div>
      </div>
      <div class="ref-badge">
        <div class="label">N° RAPPORT</div>
        <div class="number">${escapeHtml(reference)}</div>
      </div>
    </div>
    <div class="header-info">
      <div class="company-info">
        <strong>${escapeHtml(garageDisplay.name)}</strong>
        ${garageDisplay.phone ? '☎ ' + escapeHtml(garageDisplay.phone) : ''} ${garageDisplay.email ? '✉ ' + escapeHtml(garageDisplay.email) : ''}
      </div>
      <div class="date-info">
        DATE DU RAPPORT
        <strong>${new Date().toLocaleDateString('fr-FR')}</strong>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-header">
      <div class="section-number">1</div>
      <div class="section-title">IDENTIFICATION DU VÉHICULE</div>
    </div>
    <div class="info-grid">
      <div class="info-field">
        <div class="field-label">MARQUE</div>
        <div class="field-value">${escapeHtml(vehicleData?.brand) || 'Non renseigné'}</div>
      </div>
      <div class="info-field">
        <div class="field-label">MODÈLE</div>
        <div class="field-value">${escapeHtml(vehicleData?.model) || 'Non renseigné'}</div>
      </div>
      <div class="info-field">
        <div class="field-label">IMMATRICULATION</div>
        <div class="field-value">${escapeHtml(vehicleData?.plate) || 'Non renseigné'}</div>
      </div>
      <div class="info-field">
        <div class="field-label">ANNÉE</div>
        <div class="field-value">${escapeHtml(vehicleData?.year) || 'Non renseigné'}</div>
      </div>
      <div class="info-field">
        <div class="field-label">N° CHÂSSIS (VIN)</div>
        <div class="field-value">${escapeHtml(vehicleData?.vin) || 'Non renseigné'}</div>
      </div>
      <div class="info-field">
        <div class="field-label">COULEUR</div>
        <div class="field-value">${escapeHtml(vehicleData?.color) || 'Non renseigné'}</div>
      </div>
      <div class="info-field">
        <div class="field-label">KILOMÉTRAGE</div>
        <div class="field-value">${vehicleData?.mileage ? Number(vehicleData.mileage).toLocaleString('fr-FR') + ' km' : 'Non renseigné'}</div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-header">
      <div class="section-number">2</div>
      <div class="section-title">PROPRIÉTAIRE / CLIENT</div>
    </div>
    <div class="info-grid">
      <div class="info-field">
        <div class="field-label">NOM COMPLET</div>
        <div class="field-value">${escapeHtml(clientData?.name) || 'Non renseigné'}</div>
      </div>
      <div class="info-field">
        <div class="field-label">TÉLÉPHONE</div>
        <div class="field-value">${escapeHtml(clientData?.phone) || 'Non renseigné'}</div>
      </div>
      <div class="info-field">
        <div class="field-label">ADRESSE EMAIL</div>
        <div class="field-value">${escapeHtml(clientData?.email) || 'Non renseigné'}</div>
      </div>
    </div>
  </div>

  ${insuranceData?.company ? `
  <div class="section">
    <div class="section-header">
      <div class="section-number">3</div>
      <div class="section-title">INFORMATIONS ASSURANCE & SINISTRE</div>
    </div>
    <div class="info-grid">
      <div class="info-field">
        <div class="field-label">COMPAGNIE D'ASSURANCE</div>
        <div class="field-value">${escapeHtml(insuranceData?.company) || 'Non renseigné'}</div>
      </div>
      <div class="info-field">
        <div class="field-label">N° DE SINISTRE</div>
        <div class="field-value">${escapeHtml(insuranceData?.claim_number) || 'Non renseigné'}</div>
      </div>
      ${insuranceData?.accident_date ? `
      <div class="info-field">
        <div class="field-label">DATE DE L'ACCIDENT</div>
        <div class="field-value">${new Date(insuranceData.accident_date).toLocaleDateString('fr-FR')}</div>
      </div>
      ` : ''}
    </div>
  </div>
  ` : ''}

  ${damages.length > 0 ? `
  <div class="section">
    <div class="section-header">
      <div class="section-number">${insuranceData?.company ? '4' : '3'}</div>
      <div class="section-title">ANALYSE DES DOMMAGES</div>
    </div>
    <div class="ai-box">
      <div class="ai-box-header">
        <div class="ai-icon">📋</div>
        <div class="ai-box-title">DIAGNOSTIC DES DOMMAGES</div>
      </div>
      <table class="modern-table" style="margin-top: 15px;">
        <thead>
          <tr>
            <th style="width: 20%;">ZONE</th>
            <th style="width: 40%;">DESCRIPTION</th>
            <th style="width: 20%;">GRAVITÉ</th>
            <th style="width: 20%; text-align: right;">TEMPS ESTIMÉ</th>
          </tr>
        </thead>
        <tbody>
          ${damages.map((dmg) => {
            const severity = String(dmg?.severity || 'moyenne').toLowerCase();
            const statusClass = severity === 'importante' ? 'defavorable' : severity === 'legere' ? 'favorable' : 'reserve';
            const statusLabel = severity === 'importante' ? 'IMPORTANTE' : severity === 'legere' ? 'LÉGÈRE' : 'MOYENNE';
            return `
            <tr>
              <td><strong>${escapeHtml(dmg?.zone) || 'N/A'}</strong></td>
              <td>${escapeHtml(dmg?.description) || 'Description'}</td>
              <td><span class="status-badge status-${statusClass}">${statusLabel}</span></td>
              <td style="text-align: right; font-weight: 600;">${dmg?.estimated_hours || 0}h</td>
            </tr>
            `;
          }).join('')}
          <tr style="background: #f8f9fa; font-weight: 600;">
            <td colspan="3" style="text-align: right;">Total estimé</td>
            <td style="text-align: right;">${totalHours.toFixed(1)}h</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  ` : ''}

  ${adjustedDamages.length > 0 ? `
  <div class="section">
    <div class="section-header">
      <div class="section-number">${insuranceData?.company ? (damages.length > 0 ? '5' : '4') : (damages.length > 0 ? '4' : '3')}</div>
      <div class="section-title">AJUSTEMENTS EXPERT</div>
    </div>
    <div class="expert-box">
      <div class="expert-box-header">
        <div class="expert-icon">✓</div>
        <div class="expert-box-title">AJUSTEMENTS EFFECTUÉS PAR L'EXPERT</div>
      </div>
      <table class="modern-table">
        <thead>
          <tr>
            <th style="width: 20%;">ZONE AJUSTÉE</th>
            <th style="width: 40%;">OBSERVATIONS EXPERT</th>
            <th style="width: 20%;">GRAVITÉ FINALE</th>
            <th style="width: 20%; text-align: right;">TEMPS FINAL</th>
          </tr>
        </thead>
        <tbody>
          ${adjustedDamages.map((dmg) => {
            const severity = String(dmg?.severity || 'moyenne').toLowerCase();
            const statusClass = severity === 'importante' ? 'defavorable' : severity === 'legere' ? 'favorable' : 'reserve';
            const statusLabel = severity === 'importante' ? 'IMPORTANTE' : severity === 'legere' ? 'LÉGÈRE' : 'MOYENNE';
            return `
            <tr>
              <td><strong>${escapeHtml(dmg?.zone) || 'N/A'}</strong></td>
              <td>${escapeHtml(dmg?.description) || 'Ajustement'}</td>
              <td><span class="status-badge status-${statusClass}">${statusLabel}</span></td>
              <td style="text-align: right; font-weight: 700;">${dmg?.estimated_hours || 0}h</td>
            </tr>
            `;
          }).join('')}
          ${manualAdjustments?.total_hours_adjusted ? `
          <tr class="total-yellow">
            <td colspan="3" style="text-align: right; text-transform: uppercase;">TOTAL AJUSTÉ PAR L'EXPERT</td>
            <td style="text-align: right; font-size: 12pt;">${Number(manualAdjustments.total_hours_adjusted).toFixed(1)}h</td>
          </tr>
          ` : ''}
        </tbody>
      </table>
    </div>
  </div>
  ` : ''}

  ${photos.length > 0 ? `
  <div class="section">
    <div class="section-header">
      <div class="section-number">${insuranceData?.company ? (damages.length > 0 ? (adjustedDamages.length > 0 ? '6' : '5') : (adjustedDamages.length > 0 ? '5' : '4')) : (damages.length > 0 ? (adjustedDamages.length > 0 ? '5' : '4') : (adjustedDamages.length > 0 ? '4' : '3'))}</div>
      <div class="section-title">DOCUMENTATION PHOTOGRAPHIQUE (${photos.length} CLICHÉS)</div>
    </div>
    <div class="photos-grid">
      ${photos.slice(0, 6).map((photo, idx) => `
        <div class="photo-item">
          <img src="${escapeHtml(photo?.url)}" alt="Photo ${idx + 1}">
          <div class="photo-label">PHOTO ${idx + 1}</div>
        </div>
      `).join('')}
    </div>
  </div>
  ` : ''}

  <div class="footer-signatures">
    <div class="signatures-row">
      <div class="signature-box">
        <div class="label">ÉTABLI PAR</div>
        <div class="line">${escapeHtml(garageDisplay.name)}</div>
      </div>
      <div class="signature-box">
        <div class="label">DATE ET SIGNATURE EXPERT</div>
        <div class="line">${new Date().toLocaleDateString('fr-FR')}</div>
      </div>
      <div class="signature-box">
        <div class="label">CACHET DE L'ÉTABLISSEMENT</div>
        <div class="line">Tampon officiel</div>
      </div>
    </div>
    <div class="footer-company">
      <div class="name">${escapeHtml(garageDisplay.name)}</div>
      <div class="info">
        ${garageDisplay.phone ? '☎ ' + escapeHtml(garageDisplay.phone) + ' • ' : ''}${garageDisplay.email ? '✉ ' + escapeHtml(garageDisplay.email) : ''}<br>
        Rapport généré électroniquement le ${new Date().toLocaleString('fr-FR')} • N° ${escapeHtml(reference)}
      </div>
    </div>
  </div>
</body>
</html>`;
  }

  /**
   * Generate PDF using Puppeteer
   */
  static async generateWithPuppeteer(html, reference) {
    let browser;
    try {
      browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });

      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '15mm', right: '15mm', bottom: '15mm', left: '15mm' },
      });

      return {
        buffer: pdfBuffer,
        filename: `Rapport_${reference}_${new Date().toISOString().split('T')[0]}.pdf`,
      };
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  /**
   * Generate PDF using external service (DPD.io or similar)
   */
  static async generateWithExternalService(html, reference) {
    // Implementation for external PDF service
    // This is a placeholder - implement according to your chosen service
    throw new Error('External PDF service not implemented');
  }
}

/**
 * Storage Service
 */
export class StorageService {
  /**
   * Upload file to Supabase Storage
   */
  static async uploadFile(bucket, path, fileBuffer, contentType) {
    const { supabaseAdmin } = await import('../config/supabase.js');
    
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(path, fileBuffer, {
        contentType,
        upsert: true,
      });

    if (error) throw error;

    // Get public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return publicUrl;
  }

  /**
   * Delete file from storage
   */
  static async deleteFile(bucket, path) {
    const { supabaseAdmin } = await import('../config/supabase.js');
    
    const { error } = await supabaseAdmin.storage
      .from(bucket)
      .remove([path]);

    if (error) throw error;
    return true;
  }
}