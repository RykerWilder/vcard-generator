# vCard QR Generator
![vCard Generator logo](./public/favicon.ico)
This project is a small React application that generates a downloadable vCard file and a QR code containing the same contact data. It is designed for quick contact sharing and is already deployed on Netlify. You can visit the website [Here](https://vcard-generator.netlify.app/).

## Overview
The app lets a user fill in personal or business contact fields such as first name, last name, phone number, email, company, role, website, address, and notes. From these inputs, it builds a valid VCARD 3.0 text payload that can be downloaded as a .vcf file or encoded into a QR code for mobile scanning.

## How it works
The main form state is stored with React useState, starting from the initialForm object. Derived values such as the full name, full phone number, and final vCard string are computed with useMemo, which keeps the logic clean and avoids unnecessary recalculation on every render.

## Main features
- Generate a QR code from contact data using react-qrcode-logo
- Download the generated contact as a .vcf file
- Download the QR code as a PNG image from the rendered canvas
- Customize QR foreground and background colors
- Upload a company logo and embed it into the QR code
- Reset the entire form and QR preview with the Clear button

#### Deployment note
Because the project is already deployed on Netlify, the application works as a static frontend without requiring a backend service. All generation, preview, validation, and file download logic runs directly in the browser.