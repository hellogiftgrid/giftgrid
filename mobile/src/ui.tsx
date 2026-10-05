import React from 'react';
import {StyleSheet,Text,TextInput,Pressable,View,ScrollView,ActivityIndicator,Alert,Image,RefreshControl} from 'react-native';
export const colors={ink:'#17233c',muted:'#61718a',brand:'#4f46e5',bg:'#f5f6fb'};
export const styles=StyleSheet.create({page:{flex:1,backgroundColor:colors.bg},content:{padding:20,gap:16,paddingBottom:40},title:{fontSize:28,fontWeight:'800',color:colors.ink},text:{fontSize:15,lineHeight:23,color:colors.ink},muted:{fontSize:13,lineHeight:20,color:colors.muted},card:{backgroundColor:'white',padding:18,borderRadius:18,gap:12,borderWidth:1,borderColor:'#e6e9f2'},row:{flexDirection:'row',alignItems:'center',gap:10,flexWrap:'wrap'},input:{backgroundColor:'white',borderWidth:1,borderColor:'#cdd3e0',padding:13,borderRadius:12,fontSize:16,color:colors.ink},button:{backgroundColor:colors.brand,padding:13,borderRadius:12,alignItems:'center'},buttonText:{color:'white',fontSize:14,fontWeight:'700'},image:{width:'100%',height:220,borderRadius:12,backgroundColor:'#f2f3fa'},avatar:{width:40,height:40,borderRadius:20},label:{fontSize:13,fontWeight:'700',color:colors.ink}});
export function Button({title,onPress,disabled=false}:{title:string;onPress:()=>void;disabled?:boolean}){return <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress} style={[styles.button,disabled&&{opacity:.45}]}><Text style={styles.buttonText}>{title}</Text></Pressable>}
export function Field({label,value,onChangeText,secret=false,multiline=false,...rest}:any){return <View style={{gap:6}}><Text style={styles.label}>{label}</Text><TextInput accessibilityLabel={label} value={value} onChangeText={onChangeText} secureTextEntry={secret} multiline={multiline} autoCapitalize={secret?'none':'sentences'} style={[styles.input,multiline&&{minHeight:90,textAlignVertical:'top'}]} {...rest}/></View>}
export function Page({title,children,refresh,loading=false}:React.PropsWithChildren<{title:string;refresh?:()=>void;loading?:boolean}>){return <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content} refreshControl={refresh?<RefreshControl refreshing={loading} onRefresh={refresh}/>:undefined}><Text style={styles.title}>{title}</Text>{children}</ScrollView>}
export function Card({children}:React.PropsWithChildren){return <View style={styles.card}>{children}</View>}
export function Picture({uri,avatar=false}:{uri?:string;avatar?:boolean}){return uri?<Image source={{uri}} style={avatar?styles.avatar:styles.image} resizeMode={avatar?'contain':'cover'}/>:null}
export function useAction(){const [busy,setBusy]=React.useState(false);const running=React.useRef(false);const run=async(fn:()=>Promise<void>)=>{if(running.current)return;running.current=true;setBusy(true);try{await fn()}catch(e){Alert.alert('GiftGrid',e instanceof Error?e.message:'Please try again.')}finally{running.current=false;setBusy(false)}};return {busy,run}}
export function useLoad<T>(load:()=>Promise<T>,deps:React.DependencyList){
 const [data,setData]=React.useState<T>();const [error,setError]=React.useState('');const [loading,setLoading]=React.useState(true);const [revision,setRevision]=React.useState(0);
 const loader=React.useRef(load);
 React.useEffect(()=>{loader.current=load},[load]);
 const dependencyKey=JSON.stringify(deps);
 React.useEffect(()=>{let active=true;const timer=setTimeout(()=>{setLoading(true);setError('');loader.current().then(v=>{if(active)setData(v)}).catch(e=>{if(active)setError(e instanceof Error?e.message:'Unable to load this page.')}).finally(()=>{if(active)setLoading(false)})},0);return()=>{active=false;clearTimeout(timer)}},[dependencyKey,revision]);
 const refresh=React.useCallback(()=>setRevision(v=>v+1),[]);
 return {data,error,loading,refresh};
}
export function Status({loading,error}:{loading:boolean;error:string}){return loading?<ActivityIndicator color={colors.brand}/>:error?<Text accessibilityRole="alert" style={{color:'#b42318'}}>{error}</Text>:null}
