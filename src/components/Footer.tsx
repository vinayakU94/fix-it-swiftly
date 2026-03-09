import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="inline-flex items-center justify-center rounded-lg bg-primary px-3 py-2">
              <Logo variant="default" size="sm" />
            </div>
            <p className="text-sm text-muted-foreground">
              Fast, reliable repair services for your appliances and electronics.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Services
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Services</h4>
            <ul className="space-y-2">
              <li className="text-sm text-muted-foreground">Kitchen Appliances</li>
              <li className="text-sm text-muted-foreground">Household Appliances</li>
              <li className="text-sm text-muted-foreground">Audio Devices</li>
              <li className="text-sm text-muted-foreground">Power Tools</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-2">
              <li>
                <a href="mailto:fixthisservice@gmail.com" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  fixthisservice@gmail.com
                </a>
              </li>
              <li>
                <a href="tel:+916264471824" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  +91 626-447-1824
                </a>
              </li>
              <li>
                <a href="tel:+919325150810" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  +91 932-515-0810
                </a>
              </li>
              <li>
                <a 
                  href="https://share.google/zTWna4oWcrCnamg0V" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Leave a Review ⭐
                </a>
              </li>
              <li>
                <a 
                  href="https://www.instagram.com/fixthisservices/?igsh=MWgybjhvamIzaWZhYg%3D%3D" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Instagram 📸
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} fixthis. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
