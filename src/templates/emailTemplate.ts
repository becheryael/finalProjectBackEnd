const emailTemplate = (url: string) => {
  const htmlOutput = `
    <html>
        <head>
            
        </head>
        <body style="margin: 0; padding: 0;";
            <table width="100%" cellpadding="0" cellspacing="0" style="padding: 20px;">
                <tr>
                    <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 12px;">
                        <tr>
                        <td align="center" style="padding: 30px 0; background-color: #a1869e;">
                        <h1>BAM APP</h1>
                        </td>
                        </tr>
                        <tr>
                        <td style="padding: 30px;">
                        <h2>Password Reset</h2>
                            <p>You have requested a password reset. Click the button below to set a new password</p>
                            <br />
                            <a href="${url}" style="padding: 12px 24px; background-color: #a1869e; color: white; text-decoration: none; border-radius: 6px;">
                            Reset Password
                            </a>
                            <br/>
                            <br/>
                            <p>If you did not request this, please ignore this email and your password will remain unchanged. You can go along with your day and no bad things will ever happen. We promise!</p>
                            <br/>
                            <p>This link is valid for an hour.</p>
                        </td>
                        </tr>
                        <tr>
                        <td style="padding: 30px;">
                            <p>TERMS AND CONDITIONS</p>
                            <br />
                            <p style="color: #999;">We reserve the right to let bad things happen if you do decide to change our password. You should not have forgotton it that is on you and not on us. If you don't change your password in the next 24 hours we will sell all of your info to china and your soul to the devil. To stop that from happening respond "stop" to this email and send 100 shekel cash to me. To find me, call 00000000. If you can not find me you are bad a hide and seek and dont deserve to have a soul. We reserve the right to decline all of your bam requests because we know you have bad intentions. Good luck ❤️</p>
                            <p>With Love,<br/> Bam App</p>
                        </td>
                        </tr>
                        <tr>
                        <td style="padding: 20px 30px; text-align: center; font-size: 10px; color: #999;">
                            We hope you will enjoy our beautiful company colors!
                        </td>
                        </tr>
                        <tr>
                        <td style="padding: 20px 30px; text-align: center; font-size: 13px; color: #999;">
                            &copy; 2026 BAM APP, All rights reserved.
                        </td>
                        </tr>
                    </table>
                    </td>
                </tr>
            </table>
        </body>
    </html>`;
  return htmlOutput;
};

export default emailTemplate;
