#!/usr/bin/env python3
"""Generate 40 gallery images via libtv-skill."""

import json
import os
import re
import subprocess
import sys
import time

PROMPTS_FILE = "/root/feishu-oc_80d7f434b95af98ef888749eab995169/ai2art/public/images/prompts_new_40.md"
OUTPUT_DIR   = "/root/feishu-oc_80d7f434b95af98ef888749eab995169/ai2art/public/images/generated"
SCRIPTS_DIR  = "/root/.openclaw/skills/libtv-skill/scripts"
POLL_INTERVAL = 8
POLL_TIMEOUT  = 300  # 5 min per image (image generation can take time)

# 40 entry IDs + san-marino at the end
ENTRY_IDS = [
    "gallery-sweden-stockholm",      "gallery-denmark-nyhavn",
    "gallery-croatia-dubrovnik",     "gallery-hungary-budapest",
    "gallery-slovenia-lake-bled",    "gallery-romania-bran-castle",
    "gallery-bulgaria-rila-monastery","gallery-latvia-riga",
    "gallery-estonia-tallinn",       "gallery-malta-valletta",
    "gallery-serbia-belgrade",       "gallery-bosnia-sarajevo",
    "gallery-cambodia-angkor-wat",   "gallery-myanmar-shwedagon",
    "gallery-malaysia-petronas",     "gallery-singapore-marina-bay",
    "gallery-philippines-banaue",    "gallery-southkorea-gyeongbokgung",
    "gallery-taiwan-taipei-101",     "gallery-hongkong-victoria-peak",
    "gallery-macau-ruins-st-paul",   "gallery-israel-jerusalem",
    "gallery-saudi-riyadh",          "gallery-qatar-doha",
    "gallery-lebanon-bcharre",       "gallery-oman-muscat",
    "gallery-uae-dubai-frame",       "gallery-bahrain-manama",
    "gallery-georgia-tbilisi",       "gallery-armenia-dilijan",
    "gallery-azerbaijan-baku",       "gallery-kazakhstan-almaty",
    "gallery-uzbekistan-samarkand",  "gallery-kyrgyzstan-issyk-kul",
    "gallery-tajikistan-pamir",      "gallery-turkmenistan-mary",
    "gallery-kenya-masai-mara",     "gallery-luxembourg-bertrange",
    "gallery-andorra-caldea",        "gallery-liechtenstein-vaduz",
    # last entry in the file
    "gallery-san-marino-guaita",
]


def run_py(script_name, *args):
    cmd = ["python3", os.path.join(SCRIPTS_DIR, script_name)] + list(args)
    r = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
    try:
        return json.loads(r.stdout.strip())
    except Exception:
        return {"_raw": r.stdout.strip(), "_err": r.stderr.strip()}


def extract_prompts():
    with open(PROMPTS_FILE, "r") as f:
        content = f.read()
    prompts = {}
    # Split on ### gallery- entries
    parts = re.split(r"\n### (gallery-\S+)", "\n" + content)
    i = 1
    while i < len(parts):
        entry_id = parts[i]
        text = parts[i + 1] if i + 1 < len(parts) else ""
        # Trim at next ### entry
        idx = text.find("\n### ")
        if idx != -1:
            text = text[:idx]
        prompts[entry_id] = text.strip()
        i += 2
    return prompts


def poll_for_image_url(session_id):
    """Poll until we get an image URL in any message."""
    start = time.time()
    last_seq = 0
    while time.time() - start < POLL_TIMEOUT:
        resp = run_py("query_session.py", session_id, "--after-seq", str(last_seq))
        if "error" in resp and "_err" not in resp:
            time.sleep(POLL_INTERVAL)
            continue
        messages = resp.get("messages", [])
        for msg in messages:
            # Track sequence number
            msg_id = str(msg.get("id", "0"))
            seq_match = re.search(r'\d+', msg_id)
            seq = int(seq_match.group()) if seq_match else 0
            if seq > last_seq:
                last_seq = seq

            role = msg.get("role", "")
            content = msg.get("content", "")

            if not content or not isinstance(content, str):
                continue

            # tool message: result JSON with image URLs
            if role == "tool":
                try:
                    data = json.loads(content)
                    task_result = data.get("task_result", {})
                    imgs = task_result.get("images", [])
                    for img in imgs:
                        url = img.get("previewPath", "")
                        if url:
                            return url
                except (json.JSONDecodeError, TypeError):
                    pass

            # assistant message: text containing URL
            if role == "assistant":
                urls = re.findall(
                    r'https://libtv-res\.liblib\.art[^\s"\'<>]+\.(?:png|jpg|jpeg|webp)',
                    content
                )
                if urls:
                    return urls[0]

        time.sleep(POLL_INTERVAL)
    return None


def download_urls(urls, prefix):
    """Download URL list with prefix."""
    if not urls:
        return []
    args = ["--urls"] + urls + ["--output-dir", OUTPUT_DIR, "--prefix", prefix]
    resp = run_py("download_results.py", *args)
    return resp.get("downloaded", [])


def main():
    prompts = extract_prompts()
    print(f"Extracted {len(prompts)} prompts")

    successes, failures = 0, []
    all_entries = ENTRY_IDS

    for idx, entry_id in enumerate(all_entries, 1):
        print(f"\n[{idx}/40] {entry_id}")
        prompt = prompts.get(entry_id, "")
        if not prompt:
            print(f"  ! No prompt found for {entry_id}")
            failures.append(entry_id)
            continue

        # Create session
        resp = run_py("create_session.py", prompt)
        session_id = resp.get("sessionId") or resp.get("session_id")
        project_uuid = resp.get("projectUuid") or resp.get("project_uuid")
        if not session_id:
            print(f"  ! create_session failed: {resp}")
            failures.append(entry_id)
            continue

        print(f"  session={session_id}")

        # Poll for image URL
        url = poll_for_image_url(session_id)
        if not url:
            print(f"  ! Timeout for {entry_id}")
            failures.append(entry_id)
            continue

        print(f"  url={url[:80]}...")

        # Download
        downloaded = download_urls([url], entry_id)
        if downloaded:
            print(f"  ✓ {downloaded[0]}")
            successes += 1
        else:
            print(f"  ! Download failed for {entry_id}")
            failures.append(entry_id)

    # Write RESULT.md
    result_md = f"""# Image Generation Results

## Summary
- **Success:** {successes}
- **Failed:** {failures}
- **Output directory:** {OUTPUT_DIR}

## Entry IDs
"""
    for e in all_entries:
        status = "✓ success" if e not in failures else "✗ failed"
        result_md += f"- `{e}` — {status}\n"

    with open(os.path.join(OUTPUT_DIR, "RESULT.md"), "w") as f:
        f.write(result_md)

    print(f"\n✓ Done. Success={successes}, Failed={len(failures)}")
    print(f"  Output: {OUTPUT_DIR}/RESULT.md")


if __name__ == "__main__":
    main()