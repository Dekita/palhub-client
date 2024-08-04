import BrandHeader from '@components/core/brand-header';
import Dektionary from '@config/dektionary';
import Container from 'react-bootstrap/Container';
// import Markdown from 'react-markdown';
import MarkdownRenderer from '@components/core/markdown';


// new terms specific to 'PAlHUB mod manager application for palworld.
const NewTermsMarkdown = `
#### Terms and Conditions of Use
These Terms and Conditions of Use ("Terms") govern your access to and use of PalHUB Client ("the App"), including any and all services, features, and content made available through the Application. 

By using the App, you agree to comply with and be bound by these Terms. If you do not agree with these Terms, then we request you uninstall the Application from your machine.

#### User Responsibilities
You are solely responsible for the content you download and install.
You agree not to download or install any content that violates these Terms, is illegal, infringes upon the rights of others, or is otherwise harmful, offensive, or inappropriate.

#### Privacy
We respect your privacy. Please review our [Privacy Policy](/privacy) to understand how we collect, use, and protect your personal information. tldr: we dont collect or use it at all!

#### Termination
We reserve the right to terminate or suspend your access to the Application at our discretion if you violate these Terms or engage in any prohibited activities.

#### Changes to Terms
We may update these Terms from time to time, and any changes will be effective immediately upon update. Your continued use of the Application after such changes constitutes your acceptance of the revised Terms.

#### Disclaimer of Warranties
The PalHUB Client Application and its content are provided "as is" without warranties of any kind, either express or implied. We make no representations or warranties regarding the accuracy, reliability, or suitability of the content available on the Application.

#### Limitation of Liability
We shall not be liable for any direct, indirect, incidental, special, consequential, or punitive damages arising out of or in connection with your use of the Application.

#### Governing Law
These Terms shall be governed by and construed in accordance with the laws of the United Kingdom, without regard to its conflict of law principles.

#### Contact Information
If you have any questions or concerns about these Terms, please contact us via [Discord](https://discord.gg/WyTdramBkm)!

By using the Application, you acknowledge that you have read, understood, and agree to these Terms and our Privacy Policy. These Terms constitute a binding agreement between you and PalHUB.

Last updated: July 31st, 2024.`;

export default function TermsOfServicePage({ modals }) {
    const title = `${Dektionary.brandname} Terms of Service`;
    return <>
        <BrandHeader
            type='altsmall'
            tagline={title}
        />
        <Container className='noverflow'>
            <div className="col-12 col-md-10 offset-0 offset-md-1 col-lg-8 offset-lg-2">
                <div className="mx-auto px-3 pt-5 pb-4">
                    {/* <Markdown>{NewTermsMarkdown}</Markdown> */}
                    <MarkdownRenderer>{NewTermsMarkdown}</MarkdownRenderer>
                </div>
            </div>
        </Container>
    </>;
}
