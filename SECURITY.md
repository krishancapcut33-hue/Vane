# Security Policy

Vane is a self-hosted, single-user AI answering engine. This document explains
which versions receive security fixes, how to report a vulnerability privately,
and what the project considers in and out of scope.

## Supported versions

Security fixes are developed on `master` and shipped in the next Docker images.

| Version | Supported |
| --- | --- |
| `master` branch | Yes |
| Docker `latest` and `slim-latest` | Yes |
| Older commits, tags, and third-party images | No |

Vane does not maintain backports for older versions. If you build from source,
track `master`. If you run Docker, pull the latest image and recreate the
container. See the installation documentation for update instructions.

## Reporting a vulnerability

Please report vulnerabilities privately through GitHub's private vulnerability
reporting:

https://github.com/ItzCrazyKns/Vane/security/advisories/new

If private reporting is unavailable, contact the maintainer directly through
the contact options listed in the README and ask for a private channel. Do not
post vulnerability details in a public GitHub issue, discussion, or Discord
message.

A useful report includes:

- The affected version, commit, or Docker image tag.
- Your deployment method (Docker image, Docker Compose, or source), OS and
  architecture, and any reverse proxy in front of Vane.
- Steps to reproduce, ideally with a minimal proof of concept.
- The impact and the preconditions an attacker needs.
- Relevant logs or configuration with secrets redacted.
- Whether you would like to be credited.

Never include real API keys, tokens, chat contents, or uploaded documents in a
report. If a secret is required to demonstrate an issue, use a revoked or
dedicated test credential.

## What to expect

This is a volunteer-maintained project, so the following are best-effort
targets rather than guarantees:

- Acknowledgement of your report within 3 business days.
- An initial assessment within 10 business days.
- Status updates at least every 14 days while the issue is being investigated.
- A fix and a published advisory, aiming for within 90 days of the report.
  Complex issues may take longer; simple issues are usually fixed sooner.
- Credit in the advisory and release notes unless you ask to remain anonymous.

We may ask GitHub to issue a CVE for a confirmed vulnerability. We will keep
you informed if the timeline changes and will coordinate disclosure with you
before publishing details.

## Scope

### In scope

- The Vane application: API routes, the search and agent pipeline, model
  provider integrations, upload handling, and the web UI.
- The default deployment: `Dockerfile`, `Dockerfile.slim`, `entrypoint.sh`,
  `docker-compose.yaml`, and the bundled SearXNG configuration.
- Authentication and access-control flaws relative to the documented
  single-user model, such as reading files outside the uploads directory.
- Server-side request forgery that reaches internal services not intended to be
  reachable by Vane.
- Remote code execution, path traversal, or arbitrary file read/write through
  uploads, document parsing, or web scraping.
- Cross-site scripting or cross-site request forgery with demonstrated impact.
- Exposure of secrets, including credentials committed to the repository or
  endpoints that reveal stored credentials beyond their documented behavior.
- Supply-chain issues in the build or release artifacts.
- Prompt injection or model manipulation that leads to a concrete security
  impact, such as exfiltrating server-side secrets, triggering unintended tool
  actions, or reaching internal network resources.

### Out of scope

- A Vane instance exposed to the internet without authentication or other
  access control. Vane is designed as a single-user, trusted-network
  application; see [Security model and deployment](#security-model-and-deployment).
- Missing rate limiting, security headers, or TLS on a self-hosted instance,
  unless you demonstrate concrete impact.
- Jailbreaks, prompt injection, or guardrail bypasses that only change the
  text of an answer.
- Vulnerabilities in SearXNG, Ollama, model providers, or other upstream
  projects. Report those upstream. Tell us if Vane's defaults make an upstream
  issue materially worse.
- Dependency vulnerabilities with no demonstrated impact on Vane.
- Denial of service through expensive queries or resource exhaustion on your
  own deployment, and brute-force or credential-stuffing attempts.
- Self-XSS, clickjacking on pages with no sensitive action, tabnabbing, and
  scanner output without a working proof of concept.
- Social engineering, physical access, and vulnerabilities in hosting
  infrastructure.
- Incorrect or hallucinated answers. These are quality issues, not security
  issues.

## Security model and deployment

Vane has no built-in authentication or user accounts. Anyone who can reach the
HTTP port can use the instance, change its configuration, and use the model
provider credentials stored on it. The configuration API can read and write
provider credentials; for example, `GET /api/config` returns the stored
provider configuration. Treat the Vane port as an administrative interface,
not as a public website.

Recommended practices:

- Run Vane on `localhost` or a trusted private network. Do not port-forward it
  directly to the internet.
- If you need remote access, put Vane behind an authenticating reverse proxy or
  a VPN, and use TLS. Restrict access to the users who should be able to spend
  your provider credits and read your chat history.
- Restrict outbound network access if the instance is shared with people you
  do not fully trust. Vane fetches web pages and calls model provider APIs on
  behalf of whoever can reach it.
- Protect the `data/` directory. It contains `config.json` (provider API keys
  in plaintext), `db.sqlite` (chats and messages), and `uploads/` (uploaded
  documents and extracted text). Use restrictive file permissions, encrypt
  backups, and never commit or share this directory.
- Use dedicated, scoped, rotatable API keys for Vane. Rotate a key immediately
  if you suspect it was exposed.
- Keep the container image and host updated, and avoid mounting the Docker
  socket or unrelated host paths into the container.

If you intentionally run a modified or multi-user deployment, the access
controls you add are your responsibility. Security issues in Vane that only
become exploitable because of those modifications may still be worth reporting,
but they are handled on a best-effort basis.

## Safe harbor

We will not pursue legal action or ask a hosting provider to take action
against researchers who act in good faith and:

- Test only their own Vane instance, or one they have explicit permission to
  test.
- Avoid privacy violations, data destruction, and disruption of service.
- Use the minimum access necessary, stop at the first evidence of a
  vulnerability, and do not pivot to other systems.
- Do not exfiltrate data beyond what is needed to prove the issue.
- Give us reasonable time to fix the issue before public disclosure.

This statement does not waive the rights of third parties, hosting providers,
or model providers, and it does not authorize testing systems that you do not
own or have permission to test.

## Recognition

We credit reporters in the security advisory and release notes unless they ask
to remain anonymous. There is currently no bug bounty program, and reports are
handled on a best-effort basis.
