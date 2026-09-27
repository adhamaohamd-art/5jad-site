import { Component, type ReactNode } from 'react';

type Props = { children: ReactNode };
type State = { error: Error | null };

// من غير الكومبوننت ده، أي خطأ JS وقت الرندر (زي محاولة قراءة .map على حقل مش
// موجود في مستند Firestore) كان بيسقّط شجرة الريأكت كلها وتظهر شاشة بيضا تمامًا
// من غير أي رسالة. دلوقتي أي خطأ زي ده هيظهر برسالة واضحة وزرار "إعادة المحاولة"
// بدل الشاشة البيضا، وده بيحافظ على نفس هوية التصميم البصرية.
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error('5JAD render error:', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F5F1EB', padding: 24 }}>
          <div
            style={{
              maxWidth: 440, width: '100%', textAlign: 'center', padding: '32px 28px',
              borderRadius: 32, background: 'rgba(255,255,255,.8)', backdropFilter: 'blur(20px)',
              boxShadow: '0 20px 60px rgba(30,20,40,.12)', fontFamily: 'inherit',
            }}
          >
            <div style={{ fontSize: 15, fontWeight: 700, color: '#1A1A1A', marginBottom: 8 }}>حصلت مشكلة غير متوقعة</div>
            <p style={{ fontSize: 13, color: '#6b6570', lineHeight: 1.6, marginBottom: 20 }}>
              في بيانات مش سليمة أو خطأ مؤقت منع الصفحة من العرض. جرّب تاني، ولو المشكلة استمرت قول للأدمن.
            </p>
            <button
              onClick={() => { this.setState({ error: null }); window.location.reload(); }}
              style={{
                background: '#9A8BD4', color: '#fff', border: 0, borderRadius: 999,
                padding: '10px 22px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}
            >
              إعادة المحاولة
            </button>
          </div>
        </main>
      );
    }
    return this.props.children;
  }
}
