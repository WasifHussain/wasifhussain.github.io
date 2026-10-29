(() => {
    "use strict";

    const $ = (selector) => document.querySelector(selector);
    const $$ = (selector) => [...document.querySelectorAll(selector)];
    const header = $(".site-header");
    const menu = $(".menu-toggle");
    const nav = $("#primary-nav");
    const mobile = window.matchMedia("(max-width: 620px)");

    function closeMenu(restoreFocus = false) {
        nav.classList.remove("open");
        menu.setAttribute("aria-expanded", "false");
        if (restoreFocus) menu.focus();
    }

    menu.addEventListener("click", () => {
        const isOpen = menu.getAttribute("aria-expanded") === "true";
        menu.setAttribute("aria-expanded", String(!isOpen));
        nav.classList.toggle("open", !isOpen);
    });
    nav.addEventListener("click", (event) => {
        if (event.target.closest("a")) closeMenu();
    });
    document.addEventListener("click", (event) => {
        if (!header.contains(event.target)) closeMenu();
    });
    document.addEventListener("keydown", (event) => {
        if (
            event.key === "Escape" &&
            menu.getAttribute("aria-expanded") === "true"
        ) {
            closeMenu(true);
        }
    });
    mobile.addEventListener("change", () => {
        if (!mobile.matches) closeMenu();
    });

    const engineeringFocus = {
        healthcare: {
            nodes: ["EHR", "APIs"],
            core: "FHIR R4",
            label: "HEALTHCARE INTEROPERABILITY",
            title: ["Different systems.", "Shared understanding."],
            status: "Healthcare integrations: EHR systems and APIs connected through FHIR R4.",
        },
        backend: {
            nodes: ["Java", "REST"],
            core: "Spring Boot",
            label: "DEPENDABLE BACKEND SYSTEMS",
            title: ["Thoughtful architecture.", "Reliable connections."],
            status: "Backend systems: Java and REST APIs connected through Spring Boot microservices.",
        },
        delivery: {
            nodes: ["JUnit 5", "Jenkins"],
            core: "CI/CD",
            label: "TESTED. CONNECTED. DELIVERED.",
            title: ["Confidence in the code.", "Care in every release."],
            status: "Software delivery: JUnit 5 automated testing and Jenkins pipelines supporting CI/CD.",
        },
    };
    $$(".art-button").forEach((button) => {
        button.addEventListener("click", () => {
            const focus = engineeringFocus[button.dataset.focus];
            if (!focus) return;
            $$(".art-button").forEach((item) => {
                const selected = item === button;
                item.classList.toggle("active", selected);
                item.setAttribute("aria-pressed", String(selected));
            });
            $("#node-a").textContent = focus.nodes[0];
            $("#node-b").textContent = focus.nodes[1];
            $("#core-label").textContent = focus.core;
            $("#signal-label").textContent = focus.label;
            $("#signal-title").replaceChildren(
                document.createTextNode(focus.title[0]),
                document.createElement("br"),
                document.createTextNode(focus.title[1])
            );
            $("#diagram-status").textContent = focus.status;
        });
    });

    const cards = $$(".project-card");
    $$(".filter-button").forEach((button) => {
        button.addEventListener("click", () => {
            const filter = button.dataset.filter;
            let count = 0;
            cards.forEach((card) => {
                const matches =
                    filter === "all" ||
                    card.dataset.category.split(/\s+/).includes(filter);
                card.hidden = !matches;
                if (matches) count += 1;
            });
            $$(".filter-button").forEach((item) => {
                const selected = item === button;
                item.classList.toggle("active", selected);
                item.setAttribute("aria-pressed", String(selected));
            });
            const label = filter === "all" ? "all" : button.textContent.trim();
            $(
                "#filter-status"
            ).textContent = `Showing ${count} ${label} project${
                count === 1 ? "" : "s"
            }.`;
        });
    });

    const projects = {
        restaurant: {
            category: "APPLIED MACHINE LEARNING",
            title: "Restaurant Recommendation System",
            description:
                "A Django application that uses cosine similarity to help people find restaurants aligned with their preferences.",
            points: [
                "Developed a recommendation model using cosine similarity.",
                "Connected the recommendation approach to a Django web application.",
                "Worked with restaurant data to produce relevant suggestions.",
            ],
            stack: "Python · Django · Cosine similarity",
            url: "https://github.com/WasifHussain/RestaurantRecommender",
            link: "View source on GitHub",
        },
        ordering: {
            category: "FULL-STACK WEB DEVELOPMENT",
            title: "Online Food Ordering System",
            description:
                "A semester project connecting restaurant and order data with an online ordering flow and Stripe payments. The public repository currently contains project notes.",
            points: [
                "Built a web-based food-ordering system in PHP.",
                "Designed a database for restaurant and order information.",
                "Integrated Stripe for payment processing.",
            ],
            stack: "PHP · Database design · Stripe",
            url: "https://github.com/WasifHussain/Food-Ordering-System-Repo",
            link: "Read project notes",
        },
        tutor: {
            category: "MOBILE DEVELOPMENT + APPLIED ML",
            title: "Tutor Hiring Application",
            description:
                "An Android application that helps learners connect with tutors, arrange payments, and draw useful signals from reviews.",
            points: [
                "Built tutor-matching functionality with Java, Android, and Firebase.",
                "Integrated the Khalti API for payments.",
                "Added sentiment analysis of user reviews.",
            ],
            stack: "Java · Android · Firebase · Khalti API",
            url: "https://github.com/WasifHussain/TutorHiringApp",
            link: "View source on GitHub",
        },
    };
    const dialog = $(".project-dialog");
    let dialogTrigger = null;

    if (typeof dialog.showModal === "function") {
        $$(".project-details").forEach((button) => {
            button.addEventListener("click", () => {
                const project = projects[button.dataset.project];
                if (!project) return;
                dialogTrigger = button;
                $("#dialog-category").textContent = project.category;
                $("#dialog-title").textContent = project.title;
                $("#dialog-description").textContent = project.description;
                $("#dialog-points").replaceChildren(
                    ...project.points.map((point) => {
                        const item = document.createElement("li");
                        item.textContent = point;
                        return item;
                    })
                );
                $("#dialog-stack").textContent = project.stack;
                const link = $("#dialog-link");
                link.href = project.url;
                link.textContent = `${project.link} ↗`;
                link.setAttribute(
                    "aria-label",
                    `${project.link} (opens in a new tab)`
                );
                dialog.showModal();
                document.body.classList.add("dialog-open");
                $(".dialog-close").focus();
            });
        });
        $(".dialog-close").addEventListener("click", () => dialog.close());
        let pointerStartedOutside = false;
        function outsideDialog(event) {
            const bounds = dialog.getBoundingClientRect();
            return (
                event.clientX < bounds.left ||
                event.clientX > bounds.right ||
                event.clientY < bounds.top ||
                event.clientY > bounds.bottom
            );
        }
        dialog.addEventListener("pointerdown", (event) => {
            pointerStartedOutside = outsideDialog(event);
        });
        dialog.addEventListener("click", (event) => {
            if (pointerStartedOutside && outsideDialog(event)) dialog.close();
            pointerStartedOutside = false;
        });
        dialog.addEventListener("close", () => {
            document.body.classList.remove("dialog-open");
            dialogTrigger?.focus();
            dialogTrigger = null;
        });
    } else {
        $$(".project-details").forEach((button) => {
            button.hidden = true;
        });
    }

    const toast = $(".toast");
    let toastTimer;
    function showToast(message, duration = 4000) {
        window.clearTimeout(toastTimer);
        toast.textContent = message;
        toast.classList.add("visible");
        toastTimer = window.setTimeout(() => {
            toast.classList.remove("visible");
        }, duration);
    }

    function legacyCopy(email) {
        const input = document.createElement("textarea");
        input.value = email;
        input.setAttribute("aria-label", "Email address to copy");
        input.style.cssText = "position:fixed;left:-9999px;top:0;";
        document.body.append(input);
        input.select();
        let copied = false;
        try {
            copied = document.execCommand("copy");
        } catch {
            /* Offer manual copy below. */
        }
        input.remove();
        return copied;
    }

    $(".copy-email").addEventListener("click", async (event) => {
        const button = event.currentTarget;
        const email = $(".email-link").href.replace(/^mailto:/, "");
        let copied = false;
        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(email);
                copied = true;
            }
        } catch {
            /* Clipboard permissions vary; try the local fallback. */
        }
        if (!copied) copied = legacyCopy(email);
        button.focus({ preventScroll: true });
        if (copied) {
            showToast("Email address copied. Let’s talk!");
        } else {
            showToast(`Copy this email address: ${email}`, 20000);
            toast.style.userSelect = "text";
            toast.tabIndex = 0;
            toast.focus({ preventScroll: true });
            const range = document.createRange();
            range.selectNodeContents(toast);
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
        }
    });

    $("#year").textContent = String(new Date().getFullYear());

    if ("IntersectionObserver" in window) {
        const links = $$('#primary-nav a[href^="#"]');
        const visibility = new Map();
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) =>
                    visibility.set(
                        entry.target.id,
                        entry.isIntersecting ? entry.intersectionRatio : 0
                    )
                );
                const current = [...visibility.entries()].sort(
                    (a, b) => b[1] - a[1]
                )[0];
                links.forEach((link) => {
                    if (current?.[1] > 0 && link.hash === `#${current[0]}`) {
                        link.setAttribute("aria-current", "location");
                    } else {
                        link.removeAttribute("aria-current");
                    }
                });
            },
            {
                rootMargin: "-10% 0px -25% 0px",
                threshold: [0, 0.1, 0.25, 0.5, 0.75],
            }
        );
        links.forEach((link) => {
            const section = document.querySelector(link.hash);
            if (section) observer.observe(section);
        });
    }

    document.body.classList.add("js-ready");
})();
