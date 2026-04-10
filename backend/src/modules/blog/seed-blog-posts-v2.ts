/**
 * Seed Blog Posts for Vasty E-commerce Platform
 * Run: npx ts-node -r tsconfig-paths/register src/modules/blog/seed-blog-posts-v2.ts
 */

import * as dotenv from 'dotenv';
dotenv.config();

// TODO: Replace with pg Pool import
import { Pool } from 'pg';

const blogPosts = [
  {
    title: 'Why Vasty is the Best Platform to Start Your Online Business in 2026',
    slug: 'why-vasty-best-platform-start-online-business-2026',
    excerpt: 'Discover why thousands of entrepreneurs choose Vasty to launch their online stores. From easy setup to powerful features, learn what makes Vasty the ultimate e-commerce solution.',
    content: `
<h2>Start Your E-commerce Journey with Vasty</h2>
<p>In today's digital world, having an online store isn't just an option—it's a necessity. But with so many platforms available, why should you choose Vasty? Let's explore what makes Vasty the perfect partner for your business journey.</p>

<h3>1. Easy Store Setup - No Coding Required</h3>
<p>With Vasty, you can launch your store in minutes, not days. Our intuitive drag-and-drop storefront builder lets you:</p>
<ul>
<li>Choose from beautiful, professional templates</li>
<li>Customize colors, fonts, and layouts effortlessly</li>
<li>Add products with detailed descriptions and images</li>
<li>Set up payment methods with just a few clicks</li>
</ul>

<h3>2. Powerful AI-Powered Features</h3>
<p>Vasty leverages cutting-edge AI technology to give you a competitive edge:</p>
<ul>
<li><strong>AI Storefront Builder:</strong> Describe your vision, and our AI creates your perfect store</li>
<li><strong>Smart Product Recommendations:</strong> Boost sales with personalized suggestions</li>
<li><strong>AR Try-On:</strong> Let customers virtually try products before buying</li>
</ul>

<h3>3. Mobile-First Approach</h3>
<p>Over 70% of online shopping happens on mobile devices. Vasty ensures your store looks perfect on every screen, with:</p>
<ul>
<li>Responsive design that adapts automatically</li>
<li>Mobile app builder to create your branded app</li>
<li>Fast loading speeds for better user experience</li>
</ul>

<h3>4. Built-in Marketing Tools</h3>
<p>Growing your business is easy with Vasty's marketing suite:</p>
<ul>
<li>SEO optimization for better search rankings</li>
<li>Social media integration</li>
<li>Email marketing campaigns</li>
<li>Discount codes and promotional offers</li>
</ul>

<h3>5. Secure & Reliable</h3>
<p>Your business and customer data are protected with:</p>
<ul>
<li>SSL encryption on all stores</li>
<li>Secure payment processing</li>
<li>99.9% uptime guarantee</li>
<li>Regular backups and data protection</li>
</ul>

<h3>6. Comprehensive Analytics</h3>
<p>Make data-driven decisions with detailed insights on:</p>
<ul>
<li>Sales performance and trends</li>
<li>Customer behavior and preferences</li>
<li>Product performance metrics</li>
<li>Traffic sources and conversion rates</li>
</ul>

<h2>Join Thousands of Successful Sellers</h2>
<p>Whether you're selling handmade crafts, digital products, clothing, electronics, or services—Vasty has everything you need to succeed. Start your free trial today and see why entrepreneurs worldwide trust Vasty for their online business.</p>
`,
    category: 'Business',
    tags: ['vasty', 'ecommerce', 'online-store', 'startup', 'business'],
    imageUrls: ['https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=630&fit=crop'],
    featured: true,
    author: 'Alex Johnson',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    date: '2026-01-03',
  },
  {
    title: '7 Proven Strategies to Increase Your Online Store Sales',
    slug: '7-proven-strategies-increase-online-store-sales',
    excerpt: 'Struggling to boost your e-commerce sales? Learn actionable strategies that successful online sellers use to grow their revenue and build loyal customers.',
    content: `
<h2>Boost Your E-commerce Success</h2>
<p>Running an online store is exciting, but growing sales consistently can be challenging. Here are seven battle-tested strategies that successful Vasty sellers use to increase their revenue.</p>

<h3>1. Optimize Your Product Pages</h3>
<p>Your product pages are your salespeople. Make them work harder:</p>
<ul>
<li><strong>High-quality images:</strong> Use multiple angles, zoom features, and lifestyle photos</li>
<li><strong>Compelling descriptions:</strong> Focus on benefits, not just features</li>
<li><strong>Clear pricing:</strong> No hidden costs—be transparent</li>
<li><strong>Social proof:</strong> Display reviews and ratings prominently</li>
</ul>

<h3>2. Leverage Email Marketing</h3>
<p>Email remains one of the highest ROI marketing channels:</p>
<ul>
<li>Send welcome sequences to new subscribers</li>
<li>Create abandoned cart recovery emails</li>
<li>Share exclusive offers with your list</li>
<li>Send personalized product recommendations</li>
</ul>

<h3>3. Offer Free Shipping (Strategically)</h3>
<p>Free shipping increases conversions dramatically. Consider:</p>
<ul>
<li>Free shipping above a minimum order value</li>
<li>Building shipping costs into product prices</li>
<li>Free shipping for loyalty members</li>
<li>Limited-time free shipping promotions</li>
</ul>

<h3>4. Create Urgency and Scarcity</h3>
<p>Encourage faster buying decisions with:</p>
<ul>
<li>Limited-time flash sales</li>
<li>Low stock warnings</li>
<li>Countdown timers on deals</li>
<li>Exclusive, limited-edition products</li>
</ul>

<h3>5. Upsell and Cross-sell</h3>
<p>Increase average order value by:</p>
<ul>
<li>Showing "Frequently bought together" items</li>
<li>Offering product bundles at a discount</li>
<li>Suggesting upgrades or premium versions</li>
<li>Adding relevant accessories at checkout</li>
</ul>

<h3>6. Simplify Your Checkout Process</h3>
<p>Every extra step loses customers. Optimize by:</p>
<ul>
<li>Offering guest checkout option</li>
<li>Minimizing form fields</li>
<li>Providing multiple payment options</li>
<li>Showing security badges and trust signals</li>
</ul>

<h3>7. Invest in Customer Retention</h3>
<p>Repeat customers spend more and cost less to acquire:</p>
<ul>
<li>Launch a loyalty rewards program</li>
<li>Send post-purchase follow-up emails</li>
<li>Offer referral incentives</li>
<li>Provide exceptional customer service</li>
</ul>

<h2>Start Implementing Today</h2>
<p>You don't need to do everything at once. Pick two or three strategies, implement them well, and measure your results. Small improvements compound into significant growth over time.</p>
`,
    category: 'Business',
    tags: ['sales', 'ecommerce', 'marketing', 'growth', 'tips'],
    imageUrls: ['https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=1200&h=630&fit=crop'],
    featured: true,
    author: 'Maria Santos',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    date: '2026-01-07',
  },
  {
    title: 'How to Use Vasty\'s AR Try-On Feature to Boost Conversions',
    slug: 'how-to-use-vasty-ar-try-on-feature-boost-conversions',
    excerpt: 'Augmented Reality is transforming online shopping. Learn how Vasty\'s AR Try-On feature helps customers shop with confidence and increases your sales.',
    content: `
<h2>The Future of Online Shopping is Here</h2>
<p>One of the biggest challenges in e-commerce is that customers can't physically interact with products before buying. Vasty's AR Try-On feature bridges this gap, allowing customers to virtually experience products—and it's a game-changer for conversions.</p>

<h3>What is AR Try-On?</h3>
<p>Augmented Reality Try-On lets customers use their smartphone or computer camera to see how products look on them or in their space. For example:</p>
<ul>
<li><strong>Clothing:</strong> See how a shirt or dress looks on your body</li>
<li><strong>Accessories:</strong> Try on glasses, watches, or jewelry virtually</li>
<li><strong>Furniture:</strong> Visualize how a sofa looks in your living room</li>
<li><strong>Makeup:</strong> Test different shades before purchasing</li>
</ul>

<h3>Why AR Try-On Increases Sales</h3>

<h4>1. Reduces Purchase Anxiety</h4>
<p>"Will this fit?" "Will this match my style?" AR answers these questions, making customers more confident to buy.</p>

<h4>2. Decreases Return Rates</h4>
<p>When customers know exactly what they're getting, returns drop significantly—saving you time and money.</p>

<h4>3. Creates Memorable Experiences</h4>
<p>Interactive shopping experiences make your store stand out and encourage customers to share on social media.</p>

<h4>4. Increases Time on Site</h4>
<p>Customers who engage with AR features spend more time browsing, leading to higher conversion rates.</p>

<h3>How to Enable AR Try-On on Vasty</h3>
<ol>
<li>Go to your Vendor Dashboard</li>
<li>Navigate to Product Settings</li>
<li>Enable "AR Try-On" for compatible products</li>
<li>Upload the required product images (front, back, sides)</li>
<li>Our AI will process and enable the AR experience</li>
</ol>

<h3>Best Practices for AR Success</h3>
<ul>
<li>Use high-quality, well-lit product photos</li>
<li>Provide accurate size information</li>
<li>Highlight the AR feature in your marketing</li>
<li>Encourage customers to share their AR experiences</li>
</ul>

<h2>Stay Ahead of the Competition</h2>
<p>AR technology is no longer a luxury—it's becoming an expectation. By offering AR Try-On through Vasty, you're not just selling products; you're providing an experience that builds trust and drives sales.</p>
`,
    category: 'Tutorials',
    tags: ['ar', 'augmented-reality', 'vasty-features', 'technology', 'ecommerce'],
    imageUrls: ['https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200&h=630&fit=crop'],
    featured: true,
    author: 'James Lee',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    date: '2026-01-10',
  },
  {
    title: 'Complete Guide to Setting Up Payments on Your Vasty Store',
    slug: 'complete-guide-setting-up-payments-vasty-store',
    excerpt: 'Accept payments seamlessly with Vasty. This step-by-step guide covers everything from connecting Stripe to managing transactions and payouts.',
    content: `
<h2>Get Paid Easily with Vasty</h2>
<p>Setting up payments is one of the most important steps in launching your online store. Vasty makes it simple with integrated payment solutions that work worldwide. Let's walk through the setup process.</p>

<h3>Payment Options on Vasty</h3>
<p>Vasty supports multiple payment methods to serve customers globally:</p>
<ul>
<li><strong>Credit/Debit Cards:</strong> Visa, Mastercard, American Express</li>
<li><strong>Digital Wallets:</strong> Apple Pay, Google Pay</li>
<li><strong>Bank Transfers:</strong> Direct bank payments</li>
<li><strong>Buy Now, Pay Later:</strong> Installment options</li>
</ul>

<h3>Setting Up Stripe Connect</h3>
<p>Vasty uses Stripe for secure, reliable payment processing. Here's how to connect:</p>

<h4>Step 1: Access Payment Settings</h4>
<p>Go to your Vendor Dashboard → Settings → Payment Settings</p>

<h4>Step 2: Connect Stripe Account</h4>
<p>Click "Connect with Stripe" and follow the prompts to:</p>
<ul>
<li>Create a new Stripe account or connect existing one</li>
<li>Verify your business information</li>
<li>Add your bank account for payouts</li>
</ul>

<h4>Step 3: Configure Payout Schedule</h4>
<p>Choose how often you want to receive your funds:</p>
<ul>
<li>Daily payouts</li>
<li>Weekly payouts</li>
<li>Monthly payouts</li>
</ul>

<h3>Understanding Fees</h3>
<p>Transparency is important. Here's how fees work:</p>
<ul>
<li><strong>Payment Processing:</strong> Standard Stripe fees apply (varies by country)</li>
<li><strong>Platform Fee:</strong> Vasty takes a small percentage per transaction</li>
<li><strong>No Hidden Fees:</strong> What you see is what you pay</li>
</ul>

<h3>Managing Transactions</h3>
<p>Your Vasty dashboard gives you full visibility into:</p>
<ul>
<li>Real-time transaction monitoring</li>
<li>Refund processing</li>
<li>Dispute management</li>
<li>Payout history and reports</li>
</ul>

<h3>Security Features</h3>
<p>Rest easy knowing your transactions are protected by:</p>
<ul>
<li>PCI-DSS compliance</li>
<li>Fraud detection and prevention</li>
<li>3D Secure authentication</li>
<li>Encrypted data transmission</li>
</ul>

<h2>Start Accepting Payments Today</h2>
<p>With Vasty's streamlined payment setup, you can start selling and receiving payments within minutes. Focus on growing your business while we handle the payment infrastructure.</p>
`,
    category: 'Tutorials',
    tags: ['payments', 'stripe', 'vasty-features', 'setup', 'guide'],
    imageUrls: ['https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&h=630&fit=crop'],
    featured: false,
    author: 'Priya Sharma',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    date: '2026-01-14',
  },
  {
    title: 'Social Media Marketing Tips for E-commerce Success',
    slug: 'social-media-marketing-tips-ecommerce-success',
    excerpt: 'Master social media marketing for your online store. Learn platform-specific strategies, content ideas, and proven tactics to drive traffic and sales.',
    content: `
<h2>Turn Followers into Customers</h2>
<p>Social media is where your customers hang out. With the right strategy, you can turn those scrollers into loyal buyers. Here's how to make social media work for your Vasty store.</p>

<h3>Choosing the Right Platforms</h3>
<p>Not all platforms are equal. Focus on where your audience is:</p>
<ul>
<li><strong>Instagram:</strong> Visual products, lifestyle brands, younger audience</li>
<li><strong>Facebook:</strong> Broad demographics, community building, ads</li>
<li><strong>TikTok:</strong> Viral potential, Gen Z audience, creative content</li>
<li><strong>Pinterest:</strong> Home decor, fashion, DIY, planning-focused users</li>
<li><strong>LinkedIn:</strong> B2B products, professional services</li>
</ul>

<h3>Content That Converts</h3>

<h4>Product Showcases</h4>
<ul>
<li>High-quality product photos and videos</li>
<li>360-degree views and close-ups</li>
<li>Products in use (lifestyle shots)</li>
</ul>

<h4>Behind the Scenes</h4>
<ul>
<li>How products are made</li>
<li>Packaging and shipping process</li>
<li>Team introductions</li>
</ul>

<h4>User-Generated Content</h4>
<ul>
<li>Customer photos and reviews</li>
<li>Unboxing videos</li>
<li>Testimonials and success stories</li>
</ul>

<h4>Educational Content</h4>
<ul>
<li>How-to guides and tutorials</li>
<li>Tips related to your niche</li>
<li>Industry news and trends</li>
</ul>

<h3>Engagement Strategies</h3>
<ul>
<li>Respond to comments and DMs promptly</li>
<li>Ask questions to spark conversations</li>
<li>Run polls and quizzes</li>
<li>Host live Q&A sessions</li>
<li>Collaborate with other brands</li>
</ul>

<h3>Influencer Marketing</h3>
<p>Partner with influencers to expand your reach:</p>
<ul>
<li>Start with micro-influencers (1K-50K followers)</li>
<li>Choose influencers aligned with your brand values</li>
<li>Provide clear guidelines but allow creative freedom</li>
<li>Track results with unique discount codes</li>
</ul>

<h3>Paid Advertising</h3>
<p>Boost your organic efforts with targeted ads:</p>
<ul>
<li>Start with small budgets and test</li>
<li>Use retargeting for website visitors</li>
<li>Create lookalike audiences</li>
<li>A/B test ad creatives and copy</li>
</ul>

<h2>Consistency is Key</h2>
<p>Social media success doesn't happen overnight. Post consistently, engage authentically, and keep refining your strategy based on what works. Your Vasty store analytics can help you track which social channels drive the most sales.</p>
`,
    category: 'Business',
    tags: ['social-media', 'marketing', 'instagram', 'growth', 'strategy'],
    imageUrls: ['https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=1200&h=630&fit=crop'],
    featured: false,
    author: 'Chris Anderson',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
    date: '2026-01-18',
  },
];

async function seedBlogPosts() {
  console.log('🌱 Seeding Vasty-relevant blog posts...\n');

  const apiKey = process.env.DATABASE_SERVICE_KEY;
  if (!apiKey) {
    console.error('❌ DATABASE_SERVICE_KEY not found in environment');
    process.exit(1);
  }

  const database = new databaseClient(apiKey);

  for (const post of blogPosts) {
    try {
      // Check if post already exists
      const existing = await database.query
        .from('blog_posts')
        .select('id')
        .where('slug', post.slug)
        .get();

      if (existing && existing.length > 0) {
        console.log(`⏭️  Post "${post.title.substring(0, 40)}..." already exists, skipping...`);
        continue;
      }

      // Prepare tags with category
      const tags = [`cat:${post.category}`, ...post.tags];
      const dateStr = post.date + 'T10:30:00.000Z';
      const metaDesc = `${post.excerpt}||author:${post.author}||avatar:${post.avatar}`;

      // Insert blog post
      await database.query
        .from('blog_posts')
        .insert({
          user_id: 'system-vasty-blog',
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          content: post.content.trim(),
          status: 'published',
          tags: JSON.stringify(tags),
          image_urls: JSON.stringify(post.imageUrls),
          featured: post.featured,
          meta_title: post.title,
          meta_description: metaDesc,
          views_count: Math.floor(Math.random() * 500) + 100,
          likes_count: Math.floor(Math.random() * 50) + 10,
          comments_count: 0,
          rating: (Math.random() * 1.5 + 3.5).toFixed(1),
          rating_count: Math.floor(Math.random() * 30) + 5,
          published_at: dateStr,
          created_at: dateStr,
          updated_at: dateStr,
        })
        .execute();

      console.log(`✅ Created: ${post.title.substring(0, 50)}...`);
    } catch (error: any) {
      console.error(`❌ Failed: ${post.title.substring(0, 30)}... - ${error.message}`);
    }
  }

  console.log('\n🎉 Blog posts seeding complete!');
}

seedBlogPosts()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  });
