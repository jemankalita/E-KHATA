import { BrandWordmark } from '@/components/BrandLogo'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'

export function TermsPage() {
  return (
    <div className="min-h-svh bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex min-h-16 max-w-3xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <BrandWordmark className="min-w-0 shrink" />
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <Link to="/login" className="text-[13px] text-muted-foreground hover:text-foreground">
              Back
            </Link>
          </div>
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-6 py-12">
        <p className="text-[13px] text-accent">Legal</p>
        <h1 className="mt-2 font-display text-5xl text-foreground">Terms and Conditions</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          <em>E-Khata</em> — Last updated: 6 September 2026
        </p>

        <aside className="mt-8 rounded-[24px] bg-card p-5 text-sm leading-relaxed text-muted-foreground">
          <p className="font-medium text-foreground">Before you publish this</p>
          <p className="mt-2">
            This is a starting-point draft written to match the E-Khata concept (a QR-based credit ledger connecting
            shopkeepers and customers), not a legal opinion. It is not a substitute for review by a qualified lawyer
            in your jurisdiction, especially around payments, data protection, and consumer credit regulation.
            Bracketed items still need to be filled in before use.
          </p>
        </aside>

        <Section n={1} title="Acceptance of these Terms">
          <p>
            By creating an account, accessing, or using the E-Khata website, mobile app, or any related service
            (collectively, the “Service”), you (“you,” “User,” which may refer to a Shopkeeper or a Customer) agree to
            be bound by these Terms and Conditions (“Terms”). If you do not agree, do not use the Service.
          </p>
          <p>
            E-Khata is operated by <Placeholder>Company / Individual legal name</Placeholder> (“E-Khata,” “we,” “us”).
          </p>
        </Section>

        <Section n={2} title="What E-Khata Is — and Is Not">
          <p>
            E-Khata is a digital record-keeping tool that lets a Shopkeeper generate itemised bills and QR codes, and
            lets a Customer scan those QR codes so that a matching record of the transaction is kept on both sides.
          </p>
          <p className="font-medium text-foreground">E-Khata is not:</p>
          <ul>
            <li>A bank, lender, or non-banking financial company (NBFC). We do not extend credit to anyone.</li>
            <li>
              A payment processor, payment aggregator, or PSP. Where a QR code includes a UPI-style payment request,
              actual money movement happens entirely within the Customer’s own banking or UPI application — E-Khata
              does not hold, process, or have custody of funds at any point.
            </li>
            <li>
              A debt collection agency. We do not guarantee, enforce, or take responsibility for the collection of any
              amount recorded as due.
            </li>
            <li>A guarantor, arbitrator, or judge of any dispute between a Shopkeeper and a Customer.</li>
          </ul>
          <p>
            E-Khata’s role is limited to providing the technology that lets both parties keep a synchronised, timestamped
            record of a transaction.
          </p>
        </Section>

        <Section n={3} title="Eligibility & Accounts">
          <ul>
            <li>You must be at least 18 years old and legally capable of entering into a binding agreement to use the Service.</li>
            <li>
              You are responsible for providing accurate information (name, phone number, shop details, product
              catalogue, etc.) and for keeping it up to date.
            </li>
            <li>
              You are responsible for maintaining the confidentiality of your login credentials and for all activity
              that occurs under your account. Notify us immediately at <Placeholder>support email</Placeholder> if you
              suspect unauthorised access.
            </li>
            <li>
              Shopkeepers are responsible for the accuracy of every bill, item, price, and amount they enter into the
              Service. E-Khata does not verify the accuracy of any bill before a QR code is generated.
            </li>
          </ul>
        </Section>

        <Section n={4} title="How the Ledger Works (and Its Limits)">
          <ul>
            <li>
              A bill and its QR code are created solely by the Shopkeeper. Scanning the QR code by a Customer records
              that a matching entry now exists on both sides — it is not confirmation that the amount, items, or price
              are correct, and it is not, by itself, proof of payment unless a specific payment step has been separately
              completed.
            </li>
            <li>
              Outstanding balances (“dues”) shown in the Service reflect entries made by Shopkeepers and are provided
              for convenience only. E-Khata makes no representation that any amount shown as “outstanding” or
              “collected” is accurate, complete, or legally owed, and disclaims responsibility for any discrepancy
              between the Service’s records and the actual commercial relationship between a Shopkeeper and Customer.
            </li>
            <li>
              Any dispute about the accuracy of a bill, an item, an amount, or whether a due amount has actually been
              settled is a matter solely between the Shopkeeper and the Customer. E-Khata is not obligated to
              investigate, mediate, or resolve such disputes, though we may provide relevant transaction records on
              request to help the parties do so themselves.
            </li>
          </ul>
        </Section>

        <Section n={5} title="Payments">
          <ul>
            <li>
              Where the Service generates a QR code containing a payment request (for example, a UPI deep link), tapping
              or scanning it opens the Customer’s own UPI or banking application to complete payment. That transaction
              is between the Customer and their bank/UPI provider and the Shopkeeper’s bank — E-Khata is not a party to
              it and is not liable for failed, delayed, reversed, or fraudulent payments.
            </li>
            <li>
              E-Khata is not responsible for verifying that a payment shown as “completed” in a third-party app has
              actually settled, and recommends that Shopkeepers independently confirm receipt of funds through their
              own bank or UPI statement before treating a due as cleared.
            </li>
            <li>
              Any subscription or service fees charged by E-Khata itself (if applicable) will be disclosed separately at
              the time of purchase and are governed by these Terms.
            </li>
          </ul>
        </Section>

        <Section n={6} title="Acceptable Use">
          <p>You agree not to use the Service to:</p>
          <ul>
            <li>Create fraudulent, inflated, or fabricated bills, or misrepresent a transaction that did not occur.</li>
            <li>
              Impersonate another person, shop, or entity, or scan a QR code on behalf of someone without their
              knowledge or consent.
            </li>
            <li>
              Harass, threaten, or intimidate another user in connection with an outstanding due (including through any
              reminder or messaging feature the Service provides).
            </li>
            <li>
              Attempt to reverse-engineer, disrupt, overload, or gain unauthorised access to the Service or other
              users’ data.
            </li>
            <li>
              Use the Service for any purpose that violates applicable law, including consumer protection, data
              protection, or moneylending regulations in your jurisdiction.
            </li>
          </ul>
          <p>We reserve the right to suspend or terminate any account that we reasonably believe violates this section.</p>
        </Section>

        <Section n={7} title="Data & Privacy">
          <p>
            Our collection and use of personal information (names, phone numbers, addresses, transaction history, and
            product catalogues) is described in our Privacy Policy, which forms part of these Terms. By using the
            Service, you consent to that collection and use.
          </p>
          <p>
            We take reasonable technical and organisational measures to protect user data, but no system is completely
            secure, and we cannot guarantee absolute security of information transmitted through the Service.
          </p>
        </Section>

        <Section n={8} title="Intellectual Property">
          <p>
            The Service, including its design, branding, software, and underlying technology, is owned by E-Khata and
            protected by applicable intellectual property laws. You retain ownership of the business data you input
            (customer names, product catalogues, bill records), and grant E-Khata a licence to process that data solely
            to provide the Service to you.
          </p>
        </Section>

        <Section n={9} title="Disclaimers">
          <p>
            The Service is provided “as is” and “as available,” without warranties of any kind, whether express or
            implied, including but not limited to warranties of merchantability, fitness for a particular purpose,
            accuracy, or non-infringement. We do not warrant that the Service will be uninterrupted, error-free, or
            available at all times, particularly in areas with limited network connectivity.
          </p>
        </Section>

        <Section n={10} title="Limitation of Liability">
          <p>To the maximum extent permitted by applicable law, E-Khata and its officers, employees, and affiliates will not be liable for:</p>
          <ul>
            <li>Any indirect, incidental, special, consequential, or punitive damages;</li>
            <li>Any loss of revenue, profits, business opportunity, or data;</li>
            <li>
              Any dispute, financial loss, or damage arising from a transaction, bill, or due recorded (or not recorded)
              through the Service;
            </li>
          </ul>
          <p>
            arising out of or related to your use of the Service, even if advised of the possibility of such damages.
            Our total aggregate liability for any claim arising from these Terms or the Service will not exceed{' '}
            <Placeholder>a stated cap, e.g. the fees paid by you in the preceding 12 months, or a fixed nominal amount</Placeholder>
            .
          </p>
        </Section>

        <Section n={11} title="Indemnification">
          <p>
            You agree to indemnify and hold E-Khata harmless from any claim, loss, liability, or expense (including
            reasonable legal fees) arising from your use of the Service, your violation of these Terms, or your
            violation of any right of another party, including another user.
          </p>
        </Section>

        <Section n={12} title="Suspension & Termination">
          <p>
            We may suspend or terminate your access to the Service, with or without notice, if we reasonably believe you
            have violated these Terms, engaged in fraudulent activity, or if required by law. You may stop using the
            Service and request deletion of your account at any time by contacting{' '}
            <Placeholder>support email</Placeholder>, subject to our data retention obligations described in the Privacy
            Policy.
          </p>
        </Section>

        <Section n={13} title="Changes to These Terms">
          <p>
            We may update these Terms from time to time. We will notify users of material changes (for example, via the
            app or by email). Continued use of the Service after changes take effect constitutes acceptance of the
            updated Terms.
          </p>
        </Section>

        <Section n={14} title="Governing Law & Dispute Resolution">
          <p>
            These Terms are governed by the laws of <Placeholder>India / your jurisdiction</Placeholder>, without regard
            to conflict-of-law principles. Any dispute arising out of or relating to these Terms or the Service will be
            subject to the exclusive jurisdiction of the courts of <Placeholder>city/state</Placeholder>, unless
            otherwise required by applicable consumer protection law.
          </p>
        </Section>

        <Section n={15} title="Contact Us">
          <p>For questions about these Terms, contact us at:</p>
          <p>
            <Placeholder>Company name</Placeholder>
            <br />
            <Placeholder>Registered address</Placeholder>
            <br />
            <Placeholder>Support email</Placeholder> · <Placeholder>Support phone number</Placeholder>
          </p>
        </Section>

        <p className="mt-12 text-sm leading-relaxed text-muted-foreground">
          This document is a draft template for review and customisation. It should be finalised with the assistance of
          a lawyer familiar with e-commerce, payments, and consumer protection law in your target jurisdiction(s)
          before being published live.
        </p>
      </article>
    </div>
  )
}

function Section({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <section className="mt-10 space-y-3 text-[15px] leading-relaxed text-foreground/85">
      <h2 className="font-display text-2xl text-foreground">
        {n}. {title}
      </h2>
      <div className="space-y-3 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">{children}</div>
    </section>
  )
}

function Placeholder({ children }: { children: ReactNode }) {
  return <span className="italic text-muted-foreground">[{children}]</span>
}
