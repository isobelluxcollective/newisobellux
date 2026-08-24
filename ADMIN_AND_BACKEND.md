# Isobels — Admin panel features

The public website lets people browse draws, enter (paid or postal), subscribe, and see winners. Staff need a separate **admin panel** so they can run the business without touching code or the database.

The admin panel should be a private area (for example `/admin`). Only staff accounts can open it. Everyone else is sent away.

Below is what the panel needs, and why each part exists.

---

## 1. Home / dashboard

When an admin logs in, they should see a simple snapshot of the site — not a blank menu.

**Show at a glance**

- How many draws are live right now
- Which draws close in the next few days
- How many members signed up recently
- How many entries were placed this week
- Rough ticket / sales totals for the period

**Alerts**

- A draw is about to close and no winner has been chosen
- Postal postcards are waiting to be typed in
- A payment came in but did not create an entry (staff can follow it up)

This page is for daily operations: “what needs my attention today?”

---

## 2. Manage draws (prizes)

This is the core of the panel. Every prize people see on the homepage comes from here.

**What staff should be able to do**

- Create a new draw
- Edit an existing one
- Duplicate a past draw (same layout, new prize and dates)
- Save as **draft** (not visible on the website)
- **Publish** so it appears as a live draw
- **Close** it so nobody can enter any more

**What they fill in for each draw**

- Draw number (the public ID, e.g. 042)
- Prize name (full name) and a short name for cards
- Description (shown on the prize page)
- Photo of the prize
- RRP / retail value
- Date and time the draw closes (powers the countdown)
- Whether it is featured (homepage order)
- How many tickets the pool allows (used to cap how many one person can hold)

Without this screen, new prizes cannot go live except by a developer.

---

## 3. Close a draw and pick a winner

When the countdown hits zero, staff must finish the draw fairly.

**The flow**

1. Open the closed (or closing) draw.
2. See every valid entry: how many tickets each person holds, and whether they entered by purchase, subscription, or post.
3. Run a **random winner pick** that is recorded (time, method, who ran it) so the draw can be explained if asked.
4. Save the winner details you are allowed to publish: first name, city, quote, photo. (The public site no longer shows Instagram handles.)
5. Send the winner an email: they can take the piece or the cash equivalent.
6. Mark the draw closed so it disappears from “Live draws”.

**Also needed**

- Export the full entry list (for independent checking)
- Mark a postal entry invalid if the postcard was incomplete

This is the legal / trust heart of a prize draw: one prize, one winner, a process you can show.

---

## 4. Postal entries

The website tells people they can enter for free by postcard. That only works if staff can **record** those postcards.

**What staff should be able to do**

- See a queue of postcards waiting to be processed (the site promises about five working days)
- Add an entry by typing: full name, address, email, phone (optional), which draw, date the card arrived
- Give that person **one** ticket on that draw (no payment)
- Mark the card as verified, entered, or rejected
- Stop duplicates: one postcard = one entry

Until this exists, postal is only instructions on a page — nothing actually enters the draw.

---

## 5. Members

Staff need to look up a person when they email or call.

**Search** by email or first name.

**On the member page, show**

- Name and email
- Ticket balance (subscription tickets not yet allocated)
- Subscription plan and next renewal / expiry, if any
- Which live draws they are in, and how many tickets
- Past draws they entered
- Order / payment history

**Actions (careful, logged)**

- Add or remove tickets only with a written reason (refund, error)
- Cancel their monthly subscription
- Download that member’s data if they ask (privacy request)

This is support and compliance, not marketing.

---

## 6. Payments and refunds

If someone paid and did not get entries, or wants a refund before the draw closes, staff need a payments screen.

**Show**

- Recent successful payments
- Which member they belong to
- Which draw (for single purchase) or that it was a subscription
- Failed or unmatched payments

**Refund**

- Refund the card
- If the draw is still open, remove or reduce that person’s tickets on that draw
- If the draw is already closed, follow a written policy (usually no ticket reversal)

This stops “I paid but I am not in the draw” from becoming a hidden developer job.

---

## 7. Winners, community, and site copy

Several public pages are currently fixed in the website files. Admin should edit them so marketing does not wait on a code release.

| Public page | What admin edits |
| --- | --- |
| Past Winners | Name, prize, photo, quote, month (no draw number, no Instagram) |
| Community | Photos and captions; Instagram/TikTok handle to tag |
| FAQs | Questions and answers (the accordion on the homepage) |
| Postal instructions | The real company address to post to |
| Legal | Terms, Privacy, Cookie policy text |

Winner details can also be filled in when a draw is closed (section 3) and then appear on Past Winners automatically.

---

## 8. Enquiries (Contact and Press)

The Contact Us and Public Relations forms on the site currently do not land in a proper inbox.

**Admin inbox should**

- List every form submission (contact vs press)
- Show name, email, phone, message, and a reference number
- Let staff mark it new / replied / closed
- Optionally send a reply email from the Isobels address

Otherwise messages are easy to miss.

---

## 9. Who can use the admin panel

- Only people marked as **admin** (staff accounts)
- A super-admin can add or remove other admins
- Normal members never see `/admin`
- Every important action (publish draw, pick winner, change tickets, refund) should leave a simple **audit trail**: who, when, what changed

---

## Suggested order to build the panel

1. **Draws** — create, edit, publish, close (site cannot run without this)
2. **Postal logging** — the free route is already advertised
3. **Pick winner + email** — completes each draw
4. **Members + payments/refunds** — day-to-day support
5. **Winners / FAQs / legal / address** — so copy is editable
6. **Enquiry inbox** — so Contact and PR are usable

---

## What “done” looks like for staff

A typical week without a developer:

1. Upload next week’s bag or jewellery and **publish** the draw  
2. Type in **postal** cards as they arrive  
3. When the timer ends, **draw the winner**, email them, close the draw  
4. Answer **members** and **enquiries** from the same panel  
5. Update **FAQs** or **winners** photos themselves  
