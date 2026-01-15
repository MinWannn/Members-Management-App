const PDFDocument = require('pdfkit');

const generateUserHistoryPDF = (user, history, payments, res) => {
    const doc = new PDFDocument();

    doc.pipe(res);

    // Header
    doc.fontSize(20).text('Members App - User History Report', { align: 'center' });
    doc.moveDown();

    // User Info
    doc.fontSize(14).text(`User: ${user.first_name} ${user.last_name} (${user.email})`);
    doc.text(`Member Type: ${user.member_type || 'N/A'}`);
    doc.text(`Status: ${user.status}`);
    doc.moveDown();

    // Action History
    doc.fontSize(16).text('Action History');
    doc.moveDown(0.5);

    history.forEach(action => {
        doc.fontSize(12).text(`${new Date(action.created_at).toLocaleDateString()} - ${action.action_type}`);
        doc.fontSize(10).text(action.action_description);
        doc.moveDown(0.5);
    });

    doc.moveDown();

    // Payment History
    doc.fontSize(16).text('Payment History');
    doc.moveDown(0.5);

    payments.forEach(payment => {
        doc.fontSize(12).text(`${new Date(payment.created_at).toLocaleDateString()} - €${payment.amount}`);
        doc.fontSize(10).text(`Method: ${payment.payment_method} | Status: ${payment.payment_status}`);
        doc.moveDown(0.5);
    });

    doc.end();
};

const generateMembersPDF = (members, columns, title, res) => {
    const doc = new PDFDocument({ margin: 30, layout: 'landscape' });
    doc.pipe(res);

    // Title
    doc.fontSize(20).text(title, { align: 'center' });
    doc.fontSize(10).text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'center' });
    doc.moveDown();

    // Table Configuration
    const tableTop = 150;
    const itemHeight = 20;
    const startX = 30;
    const pageWidth = doc.page.width - 60;

    // Define column widths based on selection
    const availableWidth = pageWidth;
    const colWidth = availableWidth / columns.length;

    let currentY = tableTop;

    // Draw Header
    doc.font('Helvetica-Bold').fontSize(10);
    let currentX = startX;

    columns.forEach(col => {
        doc.text(col.label, currentX, currentY, { width: colWidth, align: 'left' });
        currentX += colWidth;
    });

    // Draw Line
    currentY += 15;
    doc.moveTo(startX, currentY).lineTo(startX + pageWidth, currentY).stroke();
    currentY += 10;

    // Draw Rows
    doc.font('Helvetica').fontSize(9);

    members.forEach((member, index) => {
        // Check for new page
        if (currentY > doc.page.height - 50) {
            doc.addPage({ layout: 'landscape' });
            currentY = 50;

            // Redraw Header on new page
            doc.font('Helvetica-Bold').fontSize(10);
            let headerX = startX;
            columns.forEach(col => {
                doc.text(col.label, headerX, currentY, { width: colWidth, align: 'left' });
                headerX += colWidth;
            });
            currentY += 15;
            doc.moveTo(startX, currentY).lineTo(startX + pageWidth, currentY).stroke();
            currentY += 10;
            doc.font('Helvetica').fontSize(9);
        }

        let rowX = startX;
        columns.forEach(col => {
            let text = '';
            // Handle nested properties or formatting
            if (col.key === 'subscription_status') {
                text = member.subscription_status || 'N/A';
            } else if (col.key === 'created_at') {
                text = new Date(member.created_at).toLocaleDateString();
            } else if (col.key === 'full_name') {
                text = `${member.first_name} ${member.last_name}`;
            } else {
                text = member[col.key] || '-';
            }

            doc.text(String(text), rowX, currentY, { width: colWidth - 5, align: 'left' });
            rowX += colWidth;
        });

        currentY += itemHeight;
    });

    doc.end();
};

module.exports = {
    generateUserHistoryPDF,
    generateMembersPDF
};
