"""
Realistic Seed Troubleshooting Incidents for LastFix.
Specifically modeled after the real challenges faced by Tilak Khatoria and Saumya Soni.
"""

from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models import Incident, Attempt

DEMO_INCIDENTS: List[Dict[str, Any]] = [
    {
        "title": "Wi-Fi disappeared after waking from sleep",
        "problem": "Wi-Fi adapter completely vanished from Windows 11 system tray after waking laptop from sleep mode.",
        "context": "Saumya's HP Laptop running Windows 11 Home",
        "device": "Laptop",
        "os": "Windows 11",
        "situation": "After waking from sleep",
        "subsystem": "Wi-Fi",
        "attempts": [
            {
                "action": "Restart laptop",
                "outcome": "failed",
                "notes": "Rebooted twice; network adapter remained invisible in Device Manager",
                "step_order": 1
            },
            {
                "action": "Toggle Airplane Mode on and off",
                "outcome": "failed",
                "notes": "Wi-Fi toggle remained greyed out and unclickable",
                "step_order": 2
            },
            {
                "action": "Reset network adapter in Windows Settings",
                "outcome": "worked",
                "notes": "Ran Network Reset -> Network troubleshooter reloaded Intel Wi-Fi drivers, adapter immediately restored upon reboot",
                "step_order": 3
            }
        ]
    },
    {
        "title": "External 4K monitor not detected over USB-C",
        "problem": "Secondary monitor receives no signal when connected to laptop via USB-C to HDMI adapter.",
        "context": "Tilak's MacBook Pro connected to Dell 27-inch 4K display",
        "device": "Laptop",
        "os": "macOS",
        "situation": "Connecting to external dock",
        "subsystem": "Display / HDMI",
        "attempts": [
            {
                "action": "Unplug and replug HDMI cable",
                "outcome": "failed",
                "notes": "Monitor stays black with 'No Signal' banner",
                "step_order": 1
            },
            {
                "action": "Power cycle monitor",
                "outcome": "failed",
                "notes": "Display status LED remained amber",
                "step_order": 2
            },
            {
                "action": "Reconnect display adapter and click Detect Displays in System Settings",
                "outcome": "worked",
                "notes": "Holding Option key and clicking Detect Displays forced DisplayPort handshake immediately",
                "step_order": 3
            }
        ]
    },
    {
        "title": "Windows printer offline in print spooler",
        "problem": "HP LaserJet prints fail with 'Printer is Offline' error despite being powered on and USB cable securely connected.",
        "context": "Saumya's Home Desktop printing college assignment PDF",
        "device": "Desktop",
        "os": "Windows 11",
        "situation": "Submitting print job",
        "subsystem": "Printer",
        "attempts": [
            {
                "action": "Restart printer power switch",
                "outcome": "failed",
                "notes": "Queue still shows 3 stuck jobs with 'Error - Offline' status",
                "step_order": 1
            },
            {
                "action": "Clear spooler cache in system32",
                "outcome": "failed",
                "notes": "Queue cleared but printer state remained offline",
                "step_order": 2
            },
            {
                "action": "Delete and re-add printer in Windows Settings",
                "outcome": "worked",
                "notes": "Removed device under Printers & Scanners, clicked 'Add Device', Windows re-detected USB port and test page printed instantly",
                "step_order": 3
            }
        ]
    },
    {
        "title": "Git merge conflict cascade in package-lock.json",
        "problem": "Merge conflict on package-lock.json caused npm install to crash with ERESOLVE unable to resolve dependency tree.",
        "context": "Tilak's Next.js web application repository on Linux WSL",
        "device": "Laptop",
        "os": "Linux / WSL",
        "situation": "Merging feature branch into main",
        "subsystem": "Developer Tools",
        "attempts": [
            {
                "action": "Run npm install --force",
                "outcome": "failed",
                "notes": "Bypassed dependency resolution but generated runtime type conflicts in build",
                "step_order": 1
            },
            {
                "action": "Manual merge conflict resolution in package-lock.json",
                "outcome": "failed",
                "notes": "Invalid JSON syntax produced by manual marker deletion",
                "step_order": 2
            },
            {
                "action": "Delete package-lock.json and run npm install --package-lock-only",
                "outcome": "worked",
                "notes": "Cleanly regenerated lockfile matching upstream package.json without broken peer dependencies",
                "step_order": 3
            }
        ]
    }
]


def seed_database(db: Session) -> int:
    """Populates the database with Tilak & Saumya's demo troubleshooting incidents."""
    count = 0
    for data in DEMO_INCIDENTS:
        # Check if already exists by title
        existing = db.query(Incident).filter(Incident.title == data["title"]).first()
        if existing:
            continue

        inc = Incident(
            title=data["title"],
            problem=data["problem"],
            context=data["context"],
            device=data["device"],
            os=data["os"],
            situation=data["situation"],
            subsystem=data["subsystem"]
        )
        db.add(inc)
        db.flush()

        for a_data in data["attempts"]:
            att = Attempt(
                incident_id=inc.id,
                action=a_data["action"],
                outcome=a_data["outcome"],
                notes=a_data.get("notes"),
                step_order=a_data.get("step_order", 1)
            )
            db.add(att)

        count += 1

    db.commit()
    return count
