import { google } from '@ai-sdk/google';
import { streamText, convertToModelMessages, tool } from 'ai';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const modelMessages = await convertToModelMessages(messages);

  const result = streamText({
    model: google('gemini-2.5-flash'),
    tools: {
      searchPets: tool({
        description: 'Search the FinZoo database to find available pets, check their current live prices, age, and stock status.',
        parameters: z.object({
          species: z.string().optional().describe('The species of the pet, e.g., "rabbit", "chicken", "guppy", "fish"'),
          breed: z.string().optional().describe('The specific breed of the pet, e.g., "Angora", "Silkie", "Lionhead"'),
          inStockOnly: z.boolean().optional().describe('If true, only returns pets currently in stock. If the user asks about availability, set this to true.'),
        }),
        // @ts-ignore - The installed AI SDK version types don't recognize execute for this tool config, but it works at runtime
        execute: async ({ species, breed, inStockOnly }) => {
          console.log(`[Tool Call] searchPets called with:`, { species, breed, inStockOnly });
          try {
            const supabase = await createClient();
            let query = supabase
              .from('pets')
              .select('breed, species, price, price_type, age, in_stock')
              .eq('is_visible', true);
            
            if (species) {
              query = query.ilike('species', `%${species}%`);
            }
            if (breed) {
              query = query.ilike('breed', `%${breed}%`);
            }
            if (inStockOnly) {
              query = query.eq('in_stock', true);
            }
            
            const { data, error } = await query.limit(10);
            
            if (error) {
              console.error("Supabase tool error:", error);
              return { error: "Failed to search the database. Please tell the user to check the shop page instead." } as any;
            }
            return { results: data } as any;
          } catch (e: any) {
            console.error("[Tool Call Error] Exception caught:", e);
            return { error: "An exception occurred while searching the database." } as any;
          }
        },
      }),
    },
    system: `You are "Zooey", a friendly and knowledgeable pet shop assistant at FinZoo — a premium pet shop located at 508/B/3, Pahala Padukka, Padukka, Sri Lanka.

About FinZoo:
- We sell Guppies (various breeds), ornamental Chickens, Rabbits, and other pets.
- We offer island-wide delivery across Sri Lanka.
- Contact: +94 70 196 4941 (WhatsApp available), email: contact.finzoo@gmail.com
- Website: fin-zoo.vercel.app
- We are open 24/7 online, physical visits by appointment.

Your personality:
- You are warm, enthusiastic, and genuinely passionate about pets.
- You speak naturally like a real human staff member, not like a robot.
- Use a friendly, conversational tone. Occasionally use emojis (but don't overdo it).
- Keep responses concise (2-3 sentences) unless the customer asks for lots of information.
- If greeted, respond warmly and ask how you can help.
- You can respond in Sinhala or English based on what the customer uses.

Tool Usage (CRITICAL):
- ALWAYS use the \`searchPets\` tool when the user asks about specific pets, specific breeds, prices, age, or availability.
- NEVER guess or make up prices, sizes, or stock info. If the user asks for a price, you MUST use the \`searchPets\` tool to find it.
- When you get the tool results, incorporate the prices and stock status naturally into your response. For example: "Our lovely Angora rabbits are currently RS. 1500 each, and we have some in stock!"
- If the tool returns no results, politely inform the user that we don't have that specific pet right now, and suggest they check the shop page or contact us via WhatsApp for updates.
- Note: 'each' means per animal, 'pair' means the price is for a male/female pair.`,
    messages: modelMessages,
  });

  return result.toUIMessageStreamResponse();
}
