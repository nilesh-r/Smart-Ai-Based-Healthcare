import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Send, User, MessageSquare } from 'lucide-react';
import Button from '../../components/ui/Button';

const Messages = () => {
    const { user } = useAuth();
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef<null | HTMLDivElement>(null);

    useEffect(() => {
        if (!user) return;
        fetchMessages();

        // Subscribe to real-time changes
        const subscription = supabase
            .channel('messages')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
                setMessages(current => [...current, payload.new]);
                scrollToBottom();
            })
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, [user]);

    const fetchMessages = async () => {
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .or(`sender_id.eq.${user?.id},receiver_id.eq.${user?.id}`)
            .order('created_at', { ascending: true });

        if (!error && data) {
            setMessages(data);
            scrollToBottom();
        }
        setLoading(false);
    };

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !user) return;

        // For demo, we are sending to oneself or a 'demo' receiver if we had one.
        // In a real app, you'd select a chatroom or user. 
        // We'll just insert a self-note for now to prove backend works.
        const { error } = await supabase
            .from('messages')
            .insert({
                sender_id: user.id,
                receiver_id: user.id, // Echo for demo
                content: newMessage,
                is_read: false
            });

        if (error) {
            console.error('Error sending message:', error);
        } else {
            setNewMessage('');
        }
    };

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
    };

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-900/50">
                <div className="flex items-center gap-3">
                    <div className="bg-pink-100 p-2 rounded-full text-pink-600">
                        <MessageSquare size={20} />
                    </div>
                    <div>
                        <h2 className="font-bold text-gray-900 dark:text-white">Messages</h2>
                        <p className="text-xs text-gray-500">Real-time Chat</p>
                    </div>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && !loading && (
                    <div className="text-center text-gray-400 mt-10">
                        <p>No messages yet. Start a conversation!</p>
                    </div>
                )}

                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] rounded-2xl p-3 px-5 ${msg.sender_id === user?.id
                                ? 'bg-blue-600 text-white rounded-br-none'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-bl-none'
                            }`}>
                            <p className="text-sm">{msg.content}</p>
                            <p className="text-[10px] opacity-70 mt-1 text-right">
                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={sendMessage} className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex gap-2">
                <input
                    type="text"
                    className="flex-1 rounded-xl border border-gray-300 dark:border-gray-600 px-4 py-2 focus:outline-none focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                />
                <Button type="submit" className="rounded-xl px-4">
                    <Send size={18} />
                </Button>
            </form>
        </div>
    );
};

export default Messages;
