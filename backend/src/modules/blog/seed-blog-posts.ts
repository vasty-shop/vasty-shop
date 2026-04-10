/**
 * Seed Blog Posts for Vasty E-commerce Platform
 * Run: npx ts-node -r tsconfig-paths/register src/modules/blog/seed-blog-posts.ts
 */

import * as dotenv from 'dotenv';
dotenv.config();

// TODO: Replace with pg Pool import
import { Pool } from 'pg';

// Helper to generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

const blogPosts = [
  {
    title: '10 Fashion Trends You Need to Know in 2026',
    slug: '10-fashion-trends-you-need-to-know-in-2026',
    excerpt: 'Discover the hottest fashion trends of 2026. From sustainable fashion to bold colors, here\'s what\'s dominating the style scene this year.',
    content: `
<h2>The Future of Fashion is Here</h2>
<p>Fashion in 2026 is all about self-expression, sustainability, and comfort. Whether you're a trendsetter or someone who loves classic styles, this year has something for everyone. Let's dive into the top trends shaping wardrobes worldwide.</p>

<h3>1. Sustainable & Eco-Friendly Fashion</h3>
<p>Sustainability isn't just a buzzword anymore—it's a movement. Brands are focusing on recycled materials, organic fabrics, and ethical production. Consumers are choosing quality over quantity, investing in pieces that last.</p>

<h3>2. Bold & Vibrant Colors</h3>
<p>Say goodbye to muted tones! This year, vibrant colors like electric blue, hot pink, and sunshine yellow are taking center stage. Don't be afraid to mix and match bold hues for a statement look.</p>

<h3>3. Oversized Everything</h3>
<p>Comfort meets style with oversized blazers, baggy jeans, and loose-fit shirts. The oversized trend is perfect for creating effortlessly chic outfits that feel as good as they look.</p>

<h3>4. Athleisure Revolution</h3>
<p>The line between gym wear and everyday fashion continues to blur. Stylish sneakers, yoga pants, and sporty accessories are now acceptable everywhere—from coffee shops to casual Fridays.</p>

<h3>5. Vintage & Retro Revival</h3>
<p>Everything old is new again! 90s and Y2K fashion are back with baggy jeans, crop tops, platform shoes, and nostalgic accessories making a strong comeback.</p>

<h3>6. Gender-Neutral Fashion</h3>
<p>Fashion is becoming more inclusive. Gender-neutral collections are expanding, offering versatile pieces that anyone can wear regardless of gender identity.</p>

<h3>7. Statement Accessories</h3>
<p>Chunky jewelry, bold bags, and unique sunglasses are essential. Accessories are the easiest way to elevate any outfit and showcase your personality.</p>

<h3>8. Layering Magic</h3>
<p>Layering isn't just for cold weather. Creative layering with vests, cardigans, and light jackets adds depth and interest to any ensemble.</p>

<h3>9. Minimalist Aesthetics</h3>
<p>On the opposite end, minimalism continues to thrive. Clean lines, neutral palettes, and capsule wardrobes appeal to those who prefer timeless elegance.</p>

<h3>10. Tech-Integrated Fashion</h3>
<p>Smart fabrics and wearable tech are becoming mainstream. From temperature-regulating clothes to fitness-tracking accessories, fashion and technology are merging beautifully.</p>

<h2>Conclusion</h2>
<p>Fashion in 2026 is diverse, inclusive, and exciting. Whether you prefer bold statements or subtle elegance, there's a trend for you. Start experimenting with these styles and make this year your most fashionable yet!</p>
`,
    category: 'Fashion',
    tags: ['fashion', 'trends', '2026', 'style', 'clothing'],
    imageUrls: ['https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200&h=630&fit=crop'],
    featured: true,
  },
  {
    title: 'How to Start Your Online Fashion Store: A Complete Guide',
    slug: 'how-to-start-your-online-fashion-store-complete-guide',
    excerpt: 'Dreaming of launching your own fashion brand? This comprehensive guide covers everything from planning to launching your online store.',
    content: `
<h2>Turn Your Fashion Dreams into Reality</h2>
<p>Starting an online fashion store has never been easier. With platforms like Vasty, you can launch your brand without technical expertise. Here's your step-by-step guide to success.</p>

<h3>Step 1: Define Your Niche</h3>
<p>The fashion market is vast. To stand out, you need a clear niche. Consider:</p>
<ul>
<li>Target audience (age, gender, lifestyle)</li>
<li>Style focus (streetwear, formal, bohemian, minimalist)</li>
<li>Price point (luxury, mid-range, affordable)</li>
<li>Unique selling proposition (sustainable, handmade, local)</li>
</ul>

<h3>Step 2: Source Your Products</h3>
<p>You have several options for inventory:</p>
<ul>
<li><strong>Design your own:</strong> Create original pieces with manufacturers</li>
<li><strong>Wholesale:</strong> Buy from established brands at bulk prices</li>
<li><strong>Dropshipping:</strong> Partner with suppliers who ship directly to customers</li>
<li><strong>Print-on-demand:</strong> Custom designs printed as orders come in</li>
</ul>

<h3>Step 3: Build Your Brand Identity</h3>
<p>Your brand is more than a logo. It's your story, values, and visual identity. Invest in:</p>
<ul>
<li>Professional logo design</li>
<li>Consistent color palette</li>
<li>Brand voice and messaging</li>
<li>High-quality product photography</li>
</ul>

<h3>Step 4: Set Up Your Online Store</h3>
<p>With Vasty, setting up your store is simple:</p>
<ol>
<li>Create your vendor account</li>
<li>Customize your storefront with our drag-and-drop builder</li>
<li>Add your products with detailed descriptions</li>
<li>Set up payment methods</li>
<li>Configure shipping options</li>
</ol>

<h3>Step 5: Marketing Your Store</h3>
<p>A great store needs customers. Focus on:</p>
<ul>
<li><strong>Social Media:</strong> Instagram, TikTok, and Pinterest are perfect for fashion</li>
<li><strong>Content Marketing:</strong> Start a blog, create lookbooks</li>
<li><strong>Email Marketing:</strong> Build your subscriber list early</li>
<li><strong>Influencer Partnerships:</strong> Collaborate with fashion influencers</li>
</ul>

<h3>Step 6: Customer Experience</h3>
<p>Happy customers become loyal customers:</p>
<ul>
<li>Offer excellent customer service</li>
<li>Provide detailed size guides</li>
<li>Make returns easy</li>
<li>Ask for reviews and feedback</li>
</ul>

<h2>Start Your Journey Today</h2>
<p>The fashion industry is worth billions, and there's room for your unique vision. With dedication, creativity, and the right platform, your fashion store can thrive. Start building your dream store with Vasty today!</p>
`,
    category: 'Business',
    tags: ['ecommerce', 'business', 'fashion', 'online-store', 'entrepreneur'],
    imageUrls: ['https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=630&fit=crop'],
    featured: true,
  },
  {
    title: 'The Ultimate Guide to Building a Capsule Wardrobe',
    slug: 'ultimate-guide-building-capsule-wardrobe',
    excerpt: 'Learn how to create a versatile capsule wardrobe that saves money, reduces clutter, and makes getting dressed effortless every day.',
    content: `
<h2>What is a Capsule Wardrobe?</h2>
<p>A capsule wardrobe is a carefully curated collection of essential clothing items that can be mixed and matched to create numerous outfits. It's about quality over quantity, versatility over excess.</p>

<h3>Benefits of a Capsule Wardrobe</h3>
<ul>
<li><strong>Save Money:</strong> Invest in fewer, better pieces</li>
<li><strong>Save Time:</strong> No more "I have nothing to wear" moments</li>
<li><strong>Reduce Stress:</strong> Fewer choices mean easier decisions</li>
<li><strong>Sustainability:</strong> Less consumption, less waste</li>
<li><strong>Better Style:</strong> Every piece works together</li>
</ul>

<h3>Essential Pieces for Your Capsule</h3>

<h4>Tops (8-10 pieces)</h4>
<ul>
<li>2-3 basic t-shirts (white, black, neutral)</li>
<li>2 button-down shirts</li>
<li>2 blouses or nice tops</li>
<li>2-3 sweaters or cardigans</li>
</ul>

<h4>Bottoms (5-7 pieces)</h4>
<ul>
<li>2 pairs of jeans (different washes)</li>
<li>1-2 pairs of dress pants/trousers</li>
<li>1-2 skirts (if you wear them)</li>
<li>1 pair of shorts (seasonal)</li>
</ul>

<h4>Outerwear (2-4 pieces)</h4>
<ul>
<li>1 blazer or structured jacket</li>
<li>1 casual jacket (denim or leather)</li>
<li>1 winter coat</li>
<li>1 light rain jacket</li>
</ul>

<h4>Shoes (4-6 pairs)</h4>
<ul>
<li>1 pair of comfortable sneakers</li>
<li>1 pair of dress shoes</li>
<li>1 pair of boots</li>
<li>1 pair of sandals (seasonal)</li>
<li>1 pair of flats or loafers</li>
</ul>

<h3>How to Build Your Capsule</h3>

<h4>Step 1: Audit Your Current Wardrobe</h4>
<p>Go through everything. What do you actually wear? What fits well? What makes you feel confident? Donate or sell the rest.</p>

<h4>Step 2: Define Your Style</h4>
<p>Create a mood board. What aesthetic speaks to you? Classic? Bohemian? Minimalist? Street style? Let this guide your choices.</p>

<h4>Step 3: Choose Your Color Palette</h4>
<p>Pick 3-4 neutral base colors and 2-3 accent colors. Everything should work together, making mixing and matching effortless.</p>

<h4>Step 4: Invest in Quality</h4>
<p>Spend more on pieces you'll wear often. A well-made blazer or perfect jeans are worth the investment.</p>

<h4>Step 5: Fill the Gaps</h4>
<p>Make a list of what you need. Shop intentionally, not impulsively.</p>

<h3>Maintaining Your Capsule</h3>
<p>Review your wardrobe seasonally. Replace worn items with quality pieces. Resist impulse purchases. Ask yourself: "Does this work with at least 3 items I already own?"</p>

<h2>Start Small</h2>
<p>You don't need to overhaul everything at once. Start with one category—maybe just your tops or your work clothes. Gradually build your perfect capsule wardrobe, and enjoy the freedom of a simplified closet.</p>
`,
    category: 'Fashion',
    tags: ['capsule-wardrobe', 'minimalism', 'style', 'fashion-tips', 'wardrobe'],
    imageUrls: ['https://images.unsplash.com/photo-1558171813-4c088753af8f?w=1200&h=630&fit=crop'],
    featured: false,
  },
  {
    title: 'Smart Online Shopping: Tips to Get the Best Deals',
    slug: 'smart-online-shopping-tips-best-deals',
    excerpt: 'Master the art of online shopping with these expert tips. Learn how to find discounts, avoid scams, and make smarter purchasing decisions.',
    content: `
<h2>Shop Smarter, Not Harder</h2>
<p>Online shopping offers convenience and endless options, but it can also lead to overspending and regret purchases. Here's how to become a savvy online shopper.</p>

<h3>Finding the Best Deals</h3>

<h4>1. Use Price Comparison Tools</h4>
<p>Before buying, compare prices across different platforms. Browser extensions can automatically alert you to better prices elsewhere.</p>

<h4>2. Sign Up for Newsletters</h4>
<p>Most stores offer 10-20% off your first order when you subscribe. Use a separate email for shopping newsletters to keep your inbox organized.</p>

<h4>3. Wait for Sales Events</h4>
<p>Major sales to watch for:</p>
<ul>
<li>Black Friday & Cyber Monday</li>
<li>End of Season Sales</li>
<li>Holiday Sales (New Year, Valentine's, etc.)</li>
<li>Flash Sales and Daily Deals</li>
</ul>

<h4>4. Use Cashback Apps</h4>
<p>Earn money back on purchases through cashback websites and apps. Over time, these savings add up significantly.</p>

<h4>5. Abandon Your Cart</h4>
<p>Add items to your cart and wait 24-48 hours. Many stores send discount codes to encourage you to complete your purchase.</p>

<h3>Shopping Safely Online</h3>

<h4>Verify the Website</h4>
<ul>
<li>Check for HTTPS in the URL</li>
<li>Look for reviews on third-party sites</li>
<li>Verify contact information exists</li>
<li>Check social media presence</li>
</ul>

<h4>Secure Payment Methods</h4>
<ul>
<li>Use credit cards for buyer protection</li>
<li>Consider PayPal or other secure payment services</li>
<li>Never wire money or use untraceable payment methods</li>
</ul>

<h4>Read Return Policies</h4>
<p>Before buying, understand the return policy. Look for:</p>
<ul>
<li>Return window (30 days is standard)</li>
<li>Who pays return shipping</li>
<li>Refund vs. store credit policies</li>
</ul>

<h3>Making Smart Purchases</h3>

<h4>The 24-Hour Rule</h4>
<p>For non-essential items, wait 24 hours before buying. If you still want it the next day, it's probably a worthwhile purchase.</p>

<h4>Check Reviews Carefully</h4>
<p>Look for reviews with photos. Be wary of all 5-star reviews or generic comments. Check multiple sources.</p>

<h4>Understand Sizing</h4>
<p>Always check the size guide. Read reviews for sizing feedback. When in doubt, contact customer service.</p>

<h4>Calculate Cost Per Wear</h4>
<p>A $100 jacket worn 50 times costs $2 per wear. A $30 top worn twice costs $15 per wear. Quality often beats cheap.</p>

<h3>Avoiding Buyer's Remorse</h3>
<ul>
<li>Ask yourself: "Do I need this or just want it?"</li>
<li>Consider where you'll wear/use it</li>
<li>Check if it fits your existing wardrobe/lifestyle</li>
<li>Sleep on big purchases</li>
</ul>

<h2>Happy Shopping!</h2>
<p>With these tips, you'll save money, avoid regret purchases, and become a confident online shopper. Remember: the best deal is on something you actually need and will use.</p>
`,
    category: 'Lifestyle',
    tags: ['shopping', 'online-shopping', 'deals', 'tips', 'savings'],
    imageUrls: ['https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&h=630&fit=crop'],
    featured: false,
  },
  {
    title: 'Sustainable Fashion: How to Build an Eco-Friendly Wardrobe',
    slug: 'sustainable-fashion-eco-friendly-wardrobe',
    excerpt: 'Discover how to make environmentally conscious fashion choices without sacrificing style. Your guide to sustainable shopping and wardrobe practices.',
    content: `
<h2>Fashion with a Conscience</h2>
<p>The fashion industry is one of the world's largest polluters. But as consumers, we have the power to drive change. Here's how to build a wardrobe that's kind to the planet.</p>

<h3>Understanding Fast Fashion's Impact</h3>
<p>Fast fashion creates:</p>
<ul>
<li>92 million tons of textile waste annually</li>
<li>20% of global wastewater</li>
<li>10% of global carbon emissions</li>
<li>Microplastic pollution in oceans</li>
</ul>
<p>The good news? Every sustainable choice you make helps reduce this impact.</p>

<h3>Principles of Sustainable Fashion</h3>

<h4>1. Buy Less, Choose Well</h4>
<p>The most sustainable garment is the one you already own. Before buying, ask:</p>
<ul>
<li>Do I really need this?</li>
<li>Will I wear it at least 30 times?</li>
<li>Does it work with my existing wardrobe?</li>
</ul>

<h4>2. Choose Quality Over Quantity</h4>
<p>A well-made piece lasts years, while cheap items fall apart after a few washes. Look for:</p>
<ul>
<li>Strong seams and stitching</li>
<li>Natural, durable fabrics</li>
<li>Timeless styles over trends</li>
</ul>

<h4>3. Opt for Sustainable Materials</h4>
<p>Better fabric choices include:</p>
<ul>
<li><strong>Organic Cotton:</strong> Uses less water and no pesticides</li>
<li><strong>Linen:</strong> Made from flax, biodegradable</li>
<li><strong>Hemp:</strong> Grows fast, needs little water</li>
<li><strong>Tencel/Lyocell:</strong> Made from sustainable wood pulp</li>
<li><strong>Recycled Materials:</strong> Gives new life to existing resources</li>
</ul>

<h4>4. Shop Secondhand</h4>
<p>Thrift stores, consignment shops, and online resale platforms offer:</p>
<ul>
<li>Unique finds at lower prices</li>
<li>Vintage and designer pieces</li>
<li>Zero new production impact</li>
</ul>

<h4>5. Support Ethical Brands</h4>
<p>Look for brands that prioritize:</p>
<ul>
<li>Fair wages for workers</li>
<li>Sustainable production methods</li>
<li>Transparency in supply chain</li>
<li>Eco-friendly packaging</li>
</ul>

<h3>Caring for Your Clothes</h3>
<p>Extend the life of your garments:</p>
<ul>
<li><strong>Wash less:</strong> Spot clean when possible</li>
<li><strong>Cold water:</strong> Saves energy and preserves fabric</li>
<li><strong>Air dry:</strong> Dryers damage clothes faster</li>
<li><strong>Repair:</strong> Fix small issues before they become big problems</li>
<li><strong>Proper storage:</strong> Fold knits, hang structured pieces</li>
</ul>

<h3>End-of-Life Options</h3>
<p>When you're done with a garment:</p>
<ul>
<li><strong>Donate:</strong> To charities or secondhand stores</li>
<li><strong>Sell:</strong> On resale platforms</li>
<li><strong>Swap:</strong> With friends or at swap events</li>
<li><strong>Recycle:</strong> Textile recycling programs</li>
<li><strong>Upcycle:</strong> Transform into something new</li>
</ul>

<h2>Every Choice Matters</h2>
<p>You don't have to be perfect. Even small changes—buying one less item, choosing organic, or shopping secondhand—make a difference. Together, we can create a more sustainable fashion future.</p>
`,
    category: 'Fashion',
    tags: ['sustainable-fashion', 'eco-friendly', 'environment', 'ethical-fashion', 'green'],
    imageUrls: ['https://images.unsplash.com/photo-1532453288672-3a27e9be9efd?w=1200&h=630&fit=crop'],
    featured: true,
  },
];

async function seedBlogPosts() {
  console.log('🌱 Seeding blog posts for Vasty...\n');

  const apiKey = process.env.DATABASE_SERVICE_KEY;
  if (!apiKey) {
    console.error('❌ DATABASE_SERVICE_KEY not found in environment');
    process.exit(1);
  }

  const database = new databaseClient(apiKey);

  // First, ensure we have a system user for blog posts
  let systemUserId = 'system-vasty-blog';

  for (const post of blogPosts) {
    try {
      // Check if post already exists
      const existing = await database.query
        .from('blog_posts')
        .select('id')
        .where('slug', post.slug)
        .get();

      if (existing && existing.length > 0) {
        console.log(`⏭️  Post "${post.title}" already exists, skipping...`);
        continue;
      }

      // Prepare tags with category
      const tags = [`cat:${post.category}`, ...post.tags];

      // Insert blog post
      await database.query
        .from('blog_posts')
        .insert({
          user_id: systemUserId,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          content: post.content.trim(),
          status: 'published',
          tags: JSON.stringify(tags),
          image_urls: JSON.stringify(post.imageUrls),
          featured: post.featured,
          meta_title: post.title,
          meta_description: `${post.excerpt}||author:Vasty Team||avatar:`,
          views_count: Math.floor(Math.random() * 500) + 50,
          likes_count: Math.floor(Math.random() * 50) + 5,
          comments_count: 0,
          rating: (Math.random() * 2 + 3).toFixed(1), // 3.0 - 5.0
          rating_count: Math.floor(Math.random() * 20) + 5,
          published_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .execute();

      console.log(`✅ Created post: ${post.title}`);
    } catch (error: any) {
      console.error(`❌ Failed to create post "${post.title}":`, error.message);
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
