import emailjs from '@emailjs/browser';

export interface EmailInquiryParams {
  name: string;
  email: string;
  phone: string;
  message: string;
  service?: string;
  source?: string;
}

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_owxg5fl';
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'Col_8GptFZcTwggDM';
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_j2csw28';

export const emailService = {
  /**
   * Send contact/enquiry lead details directly to client's email via EmailJS
   */
  async sendInquiryEmail(data: EmailInquiryParams): Promise<{ success: boolean; message?: string }> {
    const formattedDate = new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    const templateParams = {
      name: data.name,
      from_name: data.name,
      email: data.email,
      from_email: data.email,
      reply_to: data.email,
      phone: data.phone,
      message: data.message,
      service: data.service || 'General Website Enquiry',
      source: data.source || 'Ascend Media Labs Website',
      submission_time: formattedDate,
      date: formattedDate,
    };

    try {
      if (PUBLIC_KEY) {
        emailjs.init(PUBLIC_KEY);
      }

      const response = await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);

      if (response.status === 200) {
        return { success: true };
      }
      return { success: false, message: response.text };
    } catch (error: any) {
      console.error('EmailJS send error:', error);
      // Fallback via direct EmailJS REST API
      try {
        const restResponse = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            service_id: SERVICE_ID,
            template_id: TEMPLATE_ID,
            user_id: PUBLIC_KEY,
            template_params: templateParams,
          }),
        });

        if (restResponse.ok) {
          return { success: true };
        }
        const errText = await restResponse.text();
        return { success: false, message: errText };
      } catch (fallbackError: any) {
        return { success: false, message: fallbackError?.message || 'Failed to send email' };
      }
    }
  },
};
